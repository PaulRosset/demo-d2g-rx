import React from "react"
import { Segment, Portal, Icon } from "semantic-ui-react"

export function ReactQualityPortal(props) {
  return (
    <Portal
      trigger={
        <Icon
          name="setting"
          size="large"
          link
          corner="bottom left"
          style={{ marginLeft: 30 }}
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
          <h3>Choose a quality!</h3>
          <div>
            <button
              className={`quality-btn${
                props.quality === "HIGH" ? " selected" : ""
              }`}
              onClick={() => props.onChangeQuality("HIGH")}
            >
              Highest
            </button>
            <button
              className={`quality-btn${
                props.quality === "MEDIUM" ? " selected" : ""
              }`}
              onClick={() => props.onChangeQuality("MEDIUM")}
            >
              Medium
            </button>
            <button
              className={`quality-btn${
                props.quality === "LOW" ? " selected" : ""
              }`}
              onClick={() => props.onChangeQuality("LOW")}
            >
              Lowest
            </button>
          </div>
        </div>
      </Segment>
    </Portal>
  )
}
