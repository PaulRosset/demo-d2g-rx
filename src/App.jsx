import React, { Component, createRef } from "react";
import RxPlayer from "rx-player";
import axios from "axios";
import { Icon, Loader, Segment } from "semantic-ui-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Download2Go as D2G } from "rx-player/experimental/tools";

import Header from "./components/Header";
import ListMovies from "./components/ListMovies";
import { ReactQualityPortal } from "./utils/ReactQualityPortal";
import { ReactCustomMpd } from "./utils/ReactCustomMpd";

import { files } from "./utils/data";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isReady: false,
      quality: "LOW",
      d2gError: null,
      rxPlayerError: null,
      isSupportedD2GEncryption: null,
      statusDownloader: {},
      spaceMemory: {}
    };
    this.refVideo = createRef();
    this.downloadAssets = this.downloadAssets.bind(this);
    this.downloadCustomMpd = this.downloadCustomMpd.bind(this);
    this.playDownloadMovie = this.playDownloadMovie.bind(this);
    this.deleteDownloadMovie = this.deleteDownloadMovie.bind(this);
    this.onChangeQuality = this.onChangeQuality.bind(this);
    this.stop = this.stop.bind(this);
    this.pauseDownload = this.pauseDownload.bind(this);
    this.resumeDownload = this.resumeDownload.bind(this);
  }

  onChangeQuality(quality) {
    this.setState({
      quality
    });
  }

  async getDownloadedMovies() {
    const downloadedMovies = await this.D2G.getAllOfflineContent();
    return downloadedMovies;
  }

  async componentDidMount() {
    this.D2G = new D2G();
    await this.D2G.initDB();
    this.setState({
      isSupportedD2GEncryption: await D2G.isPersistentLicenseSupported(),
      spaceMemory: await this.D2G.getAvailableSpaceOnDevice()
    });
    this.D2G.addEventListener("progress", evt => {
      this.setState(prevState => ({
        ...prevState,
        progressUpdate: {
          ...prevState.progressUpdate,
          [evt.contentID]: {
            progress: evt.progress,
            status: evt.status
          }
        }
      }));
    });
    this.D2G.addEventListener("insertDB", async evt => {
      const downloadedMovies = await this.getDownloadedMovies();
      const spaceMemory = await this.D2G.getAvailableSpaceOnDevice();
      this.setState(prevState => ({
        ...prevState,
        spaceMemory,
        downloadedMovies,
        ...(evt.contentID === 100 && {
          statusDownloader: {
            [evt.contentID]: "done"
          }
        })
      }));
      if (evt.progress === 100) {
        toast.info(`${evt.contentID} - Download finish!`);
      }
    });
    const downloadedMovies = await this.getDownloadedMovies();
    this.setState({
      isReady: true,
      downloadedMovies
    });
    this.player = new RxPlayer({
      videoElement: this.refVideo.current
    });
    RxPlayer.LogLevel = "DEBUG";
    this.player.addEventListener("error", err => {
      console.error(err);
      this.setState({
        rxPlayerError: err
      });
      toast.error(`rxPlayer - ${err.message}`);
    });
    this.D2G.addEventListener("error", err => {
      console.error(err);
      this.setState(prevState => ({
        ...prevState,
        d2gError: err
      }));
      toast.error(
        `${err.contentID ? `${err.contentID} - ` : ""} ${err.error.message}`
      );
    });
  }

  async downloadAssets({ manifest, id, name, transport }) {
    this.setState({
      d2gError: null
    });
    await this.D2G.download({
      url: manifest,
      contentID: id,
      transport,
      metaData: { name },
      adv: {
        quality: this.state.quality
      }
    });
    this.setState(prevState => ({
      ...prevState,
      statusDownloader: {
        ...prevState.statusDownloader,
        [id]: "downloading"
      }
    }));
  }

  async downloadCustomMpd({ manifest, id, name, transport, encryption }) {
    const { data } =
      encryption && encryption.cert
        ? await axios.get(encryption.cert, { responseType: "arraybuffer" })
        : { data: null };
    await this.D2G.download({
      url: manifest,
      contentID: id,
      transport,
      metaData: { name },
      adv: {
        quality: this.state.quality
      },
      ...(encryption && {
        keySystems: {
          type: encryption.drm,
          ...(encryption.cert && { serverCertificate: data }),
          getLicense(challenge) {
            return axios
              .post(encryption.license, challenge, {
                responseType: "arraybuffer"
              })
              .then(res => {
                return res.data;
              });
          }
        }
      })
    });
  }

  async playDownloadMovie(id) {
    try {
      this.setState({
        rxPlayerError: null
      });
      const movieEntry = await this.D2G.getSingleContent(id);
      this.player.loadVideo({
        autoPlay: true,
        transport: "local",
        transportOptions: {
          manifestLoader(_, { resolve }) {
            resolve({
              data: movieEntry.offlineManifest
            });
          }
        },
        ...(movieEntry.contentProtection && {
          keySystems: [
            {
              type: movieEntry.contentProtection.type,
              // persistentState: "required",
              persistentLicense: true,
              licenseStorage: {
                save() {},
                load() {
                  return movieEntry.contentProtection.sessionsIDS;
                }
              },
              getLicense() {
                return null;
              }
            }
          ]
        })
      });
    } catch (e) {
      this.setState({
        rxPlayerError: e
      });
      toast.error(`error - ${e.message}`);
    }
  }

  async deleteDownloadMovie(id) {
    await this.D2G.deleteContent(id);
    if (this.state.progressUpdate && this.state.progressUpdate[id]) {
      delete this.state.progressUpdate[id];
      this.setState(this.state);
    }
    this.setState({
      downloadedMovies: await this.getDownloadedMovies(),
      spaceMemory: await this.D2G.getAvailableSpaceOnDevice()
    });
  }

  pauseDownload(id) {
    this.D2G.pause(id);
    this.setState(prevState => ({
      ...prevState,
      statusDownloader: {
        ...prevState.statusDownloader,
        [id]: "paused"
      }
    }));
  }

  async resumeDownload(id) {
    await this.D2G.resume(id);
    this.setState(prevState => ({
      ...prevState,
      statusDownloader: {
        ...prevState.statusDownloader,
        [id]: "downloading"
      }
    }));
  }

  stop() {
    this.player.stop();
  }

  componentWillUnmount() {
    this.player.removeEventListener("error");
    this.D2G.removeEventListener("error");
    this.D2G.removeEventListener("progress");
    this.D2G.removeEventListener("insertDB");
  }

  render() {
    return (
      <div className="App">
        <Header />
        <div className="body">
          {!this.state.isReady ? (
            <Loader active inline="centered" />
          ) : (
            <>
              <ToastContainer />
              <div style={{ textAlign: "left" }}>
                <ReactQualityPortal
                  quality={this.state.quality}
                  onChangeQuality={this.onChangeQuality}
                />
                <ReactCustomMpd
                  downloadAssets={this.downloadCustomMpd}
                  isEncryptionSupported={this.state.isSupportedD2GEncryption}
                />
                <Segment textAlign="center">
                  Is current environnment supported for D2G Encrypted content:
                  {this.state.isSupportedD2GEncryption ? (
                    <span style={{ color: "#21ba45", fontWeight: "bold" }}>
                      SUPPORTED!
                    </span>
                  ) : (
                    <span style={{ color: "#db2828", fontWeight: "bold" }}>
                      NOT SUPPORTED!
                    </span>
                  )}
                </Segment>
                <Segment textAlign="center">
                  Storage memory managment:{" "}
                  {Math.round(this.state.spaceMemory.used)}MB /{" "}
                  {Math.round(this.state.spaceMemory.total)}MB
                </Segment>
                <ListMovies
                  downloadedMovies={this.state.downloadedMovies}
                  downloadAssets={this.downloadAssets}
                  files={files}
                  progressBar={this.state.progressUpdate}
                  play={this.playDownloadMovie}
                  delete={this.deleteDownloadMovie}
                  pause={this.pauseDownload}
                  start={this.resumeDownload}
                  statusDownloader={this.state.statusDownloader}
                />
              </div>
            </>
          )}
          <div className="rxplayer-video">
            <div className="controls-player">
              <Icon
                name="stop"
                size="large"
                link
                bordered
                onClick={this.stop}
              />
            </div>
            <div>
              <video className="video-player" ref={this.refVideo} controls />
              {this.state.rxPlayerError && (
                <span className="error-displayer">
                  {this.state.rxPlayerError.name} -{" "}
                  {this.state.rxPlayerError.message}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
