import React, { useState } from "react"
import { Segment, Portal, Icon, Radio } from "semantic-ui-react"
import { Formik, Form, Field, ErrorMessage } from "formik"
import * as yup from "yup"

export function ReactCustomMpd(props) {
  const [isAdvOpen, setAdvOpen] = useState(false)
  return (
    <Portal
      trigger={
        <Icon
          name="plus"
          size="large"
          link
          corner="bottom left"
          style={{ marginLeft: 10 }}
          bordered
        />
      }
      closeOnTriggerClick
      openOnTriggerClick
    >
      <Segment
        style={{
          left: "40%",
          position: "fixed",
          top: "30%",
          zIndex: 1000,
          backgroundColor: "#22252a",
          color: "white",
        }}
      >
        <div>
          <h3 className="header-custom">
            Custom downloader!{" "}
            {props.isEncryptionSupported ? 
            <Radio
              slider
              onChange={_ => setAdvOpen(!isAdvOpen)}
              checked={isAdvOpen}
            /> : null}
          </h3>
          <Formik
            initialValues={{
              name: "",
              mpd: "",
              drm: "",
              transport: "dash",
              license: "",
              cert: "",
            }}
            validate={values => {
              let errors = {}
              if (values.drm && !values.license) {
                errors.license = "You must provide a license url!"
              }
              return errors
            }}
            validationSchema={yup.object().shape({
              name: yup.string().required(),
              mpd: yup.string().required(),
              transport: yup.string().required(),
              drm: yup.string(),
              license: yup.string(),
              cert: yup.string(),
            })}
            onSubmit={(value, { setSubmitting, resetForm }) => {
              const contentIsEncrypted = isAdvOpen && value.drm && value.license
              props
                .downloadAssets({
                  manifest: value.mpd,
                  id: `${value.name}--${Math.floor(Math.random() * 10000) +
                    10}`,
                  transport: value.transport,
                  name: value.name,
                  ...(contentIsEncrypted && {
                    encryption: {
                      drm: value.drm,
                      license: value.license,
                      cert: value.cert,
                    },
                  }),
                })
                .then(() => {
                  setSubmitting(false)
                })
            }}
          >
            {({ isSubmitting, values, setFieldValue }) => (
              <Form className="inputs-custom">
                <Field
                  type="text"
                  className="input-custom"
                  name="name"
                  placeholder="Name"
                />
                <ErrorMessage name="name" component="div" />
                <Field
                  type="text"
                  name="mpd"
                  placeholder="URL to the MPD"
                  className="input-custom"
                />
                <ErrorMessage name="mpd" component="div" />
                <div className="transportOptions">
                  <div>
                    <label>DASH</label>
                    <input
                      type="radio"
                      className="transport-btn"
                      name="transport"
                      onChange={() => {
                        setFieldValue("transport", "dash")
                      }}
                      checked={values.transport === "dash"}
                      value={values.transport}
                    />
                  </div>
                  <div>
                    <label>Smooth</label>
                    <input
                      type="radio"
                      className="transport-btn"
                      name="transport"
                      onChange={() => {
                        setFieldValue("transport", "smooth")
                      }}
                      checked={values.transport === "smooth"}
                      value={values.transport}
                    />
                  </div>
                  <ErrorMessage name="transport" component="div" />
                </div>
                {isAdvOpen && (
                  <>
                    <div>
                      <ErrorMessage name="drm" component="div" />
                      <input
                        type="radio"
                        className="quality-btn"
                        name="drm"
                        onChange={() => {
                          setFieldValue("drm", "widevine")
                        }}
                        value={values.drm}
                      />
                      <label>Widevine</label>
                      {/* <input
                        type="radio"
                        className="quality-btn"
                        name="drm"
                        onChange={() => {
                          setFieldValue("drm", "playready")
                        }}
                        value={values.drm}
                      />
                      <label>PlayReady</label> */}
                    </div>
                    <Field
                      type="text"
                      name="license"
                      placeholder="License server URL"
                      className="input-custom"
                    />
                    <ErrorMessage name="license" component="div" />
                    <Field
                      type="text"
                      name="cert"
                      placeholder="Server certificate URL"
                      className="input-custom"
                    />
                    <ErrorMessage name="cert" component="div" />
                  </>
                )}
                <button
                  type="submit"
                  className="submit-button"
                  disabled={isSubmitting}
                >
                  Download!
                </button>
              </Form>
            )}
          </Formik>
        </div>
      </Segment>
    </Portal>
  )
}
