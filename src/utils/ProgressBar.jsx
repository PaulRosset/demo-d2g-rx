import React from "react"

function CircularProgressBar(props) {
  // Size of the enclosing square
  const sqSize = props.sqSize
  // SVG centers the stroke width on the radius, subtract out so circle fits in square
  const radius = (props.sqSize - props.strokeWidth) / 2
  // Enclose cicle in a circumscribing square
  const viewBox = `0 0 ${sqSize} ${sqSize}`
  // Arc length at 100% coverage is the circle circumference
  const dashArray = radius * Math.PI * 2
  // Scale 100% coverage overlay with the actual percent
  const dashOffset = dashArray - (dashArray * props.percentage) / 100

  return (
    <svg
      className="progressBarSvg"
      width={props.sqSize}
      height={props.sqSize}
      viewBox={viewBox}
      onClick={props.type !== "paused" ? props.stop : props.start}
    >
      <circle
        className="circle-background"
        cx={props.sqSize / 2}
        cy={props.sqSize / 2}
        r={radius}
        strokeWidth={`${props.strokeWidth}px`}
      />
      <circle
        className="circle-progress"
        cx={props.sqSize / 2}
        cy={props.sqSize / 2}
        r={radius}
        strokeWidth={`${props.strokeWidth}px`}
        // Start progress marker at 12 O'Clock
        transform={`rotate(-90 ${props.sqSize / 2} ${props.sqSize / 2})`}
        style={{
          strokeDasharray: dashArray,
          strokeDashoffset: dashOffset,
        }}
      />
      {props.type !== "paused" ? (
        <svg
          className="actions"
          xmlns="http://www.w3.org/2000/svg"
          xmlns="http://www.w3.org/2000/svg"
          x="29%"
          y="29%"
          dy=".3em"
          width="15"
          height="15"
          viewBox="0 0 21 21"
          fill="rgb(236, 54, 85)"
        >
          <path d="M2 2h20v20h-20z" />
        </svg>
      ) : (
        <svg
          className="actions"
          xmlns="http://www.w3.org/2000/svg"
          x="30%"
          y="25%"
          dy=".3em"
          width="20"
          height="20"
          viewBox="0 0 21 21"
          fill="rgb(236, 54, 85)"
        >
          <path d="M16.75 10.83L4.55 19A1 1 0 0 1 3 18.13V1.87A1 1 0 0 1 4.55 1l12.2 8.13a1 1 0 0 1 0 1.7z" />
        </svg>
      )}
    </svg>
  )
}

export default CircularProgressBar
