import React, { useState } from "react"
import { Icon, Popup } from "semantic-ui-react"
import { Rehover } from "rehover"

import Loading from "../assets/bars.svg"
import CircularProgressBar from "../utils/ProgressBar"
import CircularProgressBarWhInterac from "../utils/ProgressBarWhInterac"

import One from "../assets/1.png"
import Two from "../assets/2.jpg"
import Three from "../assets/3.jpg"
import Four from "../assets/4.jpg"
import Five from "../assets/5.jpg"
import Six from "../assets/6.jpg"
import Seven from "../assets/7.jpg"
import Eight from "../assets/logo-2.svg"

const thumbnails = {
  1: One,
  2: Two,
  3: Three,
  4: Four,
  5: Five,
  6: Six,
  7: Seven,
}

export default function ListMovies(props) {
  const [loader, setLoader] = useState({})
  const [loaderCustom, setLoaderCustom] = useState({})
  const customDownloads = props.downloadedMovies.filter(
    b => !props.files.map(elem => elem.id).includes(b.contentID)
  )
  return (
    <div className="possible-downloaded-movie">
      {props.files.map(file => {
        const fileDownloaded = props.downloadedMovies.find(
          elem => elem.contentID === file.id
        )
        return (
          <div className="file-movies" key={file.id}>
            <div className="thumbnail-segment">
              <img
                src={thumbnails[file.id]}
                alt="image file"
                className="thumbnail-file"
              />
              {loader[file.id] ? (
                <img src={Loading} alt="loader" className="loader" />
              ) : null}
              <div className="thumbnail-bta">
                <div>
                  {file.name}{" "}
                  <span className="transport">({file.transport})</span>
                </div>
                <div>
                  {!fileDownloaded &&
                  (!props.progressBar ||
                    (props.progressBar && !props.progressBar[file.id])) ? (
                    <Icon
                      name="download"
                      link
                      bordered
                      size="large"
                      style={{ color: "#ec3655", borderRadius: 4 }}
                      onClick={() => {
                        setLoader({ [file.id]: true })
                        props
                          .downloadAssets({
                            manifest: file.manifest,
                            id: file.id,
                            name: file.name,
                            transport: file.transport,
                          })
                          .then(() => setLoader({ [file.id]: false }))
                      }}
                    />
                  ) : fileDownloaded &&
                    fileDownloaded.progress.percentage === 100 ? (
                    <Rehover delay={150}>
                      <div source="true">
                        <Icon
                          name="download"
                          link
                          bordered
                          size="large"
                          style={{
                            color: "black",
                            backgroundColor: "#ec3655",
                            borderRadius: 4,
                          }}
                        />
                      </div>
                      <div destination="true" className="hidden-actions">
                        <Popup
                          content="Play the downloaded video"
                          trigger={
                            <Icon
                              name="play"
                              link
                              bordered
                              style={{ color: "#ec3655" }}
                              onClick={() => props.play(file.id)}
                            />
                          }
                        />
                        <Popup
                          content="Delete the downloaded video"
                          trigger={
                            <Icon
                              name="delete"
                              link
                              bordered
                              style={{ color: "#ec3655" }}
                              onClick={() => {
                                setLoader({ [file.id]: true })
                                props.delete(file.id).then(() => {
                                  setLoader({ [file.id]: false })
                                })
                              }}
                            />
                          }
                        />
                      </div>
                    </Rehover>
                  ) : (
                    <Rehover delay={150}>
                      <div source="true">
                        <CircularProgressBar
                          strokeWidth="3"
                          sqSize="40"
                          percentage={
                            props.progressBar && props.progressBar[file.id]
                              ? props.progressBar[file.id].progress
                              : fileDownloaded.progress.percentage
                          }
                          type={
                            props.statusDownloader[file.id]
                              ? props.statusDownloader[file.id]
                              : fileDownloaded &&
                                fileDownloaded.progress.percentage < 100
                              ? "paused"
                              : "downloading"
                          }
                          stop={() => props.pause(file.id)}
                          start={() => props.start(file.id)}
                        />
                      </div>
                      <div destination="true" className="hidden-actions">
                        <Popup
                          content="Play the downloaded video"
                          trigger={
                            <Icon
                              name="play"
                              link
                              bordered
                              style={{ color: "#ec3655" }}
                              onClick={() => props.play(file.id)}
                            />
                          }
                        />
                        <Popup
                          content="Delete the downloaded video"
                          trigger={
                            <Icon
                              name="delete"
                              link
                              bordered
                              style={{ color: "#ec3655" }}
                              onClick={() => {
                                setLoader({ [file.id]: true })
                                props.delete(file.id).then(() => {
                                  setLoader({ [file.id]: false })
                                })
                              }}
                            />
                          }
                        />
                      </div>
                    </Rehover>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      })}
      {customDownloads.map(({ metaData, progress, contentID }, key) => (
        <div key={key} className="file-movies">
          <div className="thumbnail-segment --custom">
            <img src={Eight} alt="image file" className="thumbnail-file" />
            {loaderCustom[contentID] ? (
              <img src={Loading} alt="loader" className="loader" />
            ) : null}
            <div className="thumbnail-bta">
              {`Custom - ${metaData.name}`}
              <div className="customDownload-actions">
                <Popup
                  trigger={
                    <div>
                      <CircularProgressBarWhInterac
                        strokeWidth="3"
                        sqSize="40"
                        percentage={Math.round(progress.percentage)}
                      />
                    </div>
                  }
                  content="Pause/Resume on custom content is not enabled"
                />
                {progress.percentage > 0 && (
                  <Icon
                    name="play"
                    link
                    bordered
                    size="large"
                    style={{ color: "#ec3655", borderRadius: 4 }}
                    onClick={() => props.play(contentID)}
                  />
                )}
                <Icon
                  name="delete"
                  link
                  bordered
                  size="large"
                  style={{ color: "#ec3655", borderRadius: 4 }}
                  onClick={() => {
                    setLoaderCustom({ [contentID]: true })
                    props.delete(contentID).then(() => {
                      setLoaderCustom({ [contentID]: false })
                    })
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
