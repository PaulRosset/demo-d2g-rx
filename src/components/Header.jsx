import React from "react"

import logoD2G from "./../assets/logo_white.png"
import canalLogo from "./../assets/canalp.svg"

export default function Header() {
  return (
    <header>
      <section>
        <a href="https://github.com/canalplus/rx-player" target="_blank">
          <img alt="D2G" src={logoD2G} className="image-logo-d2g" />
        </a>
      </section>
      <section className="additional-tools">
        <a href="https://www.mycanal.fr" target="_blank">
          <img alt="canal" src={canalLogo} className="image-logo" />
        </a>
        <span className="gh-button">
          <a
            className="github-button"
            href="https://github.com/canalplus/rx-player"
            data-icon="octicon-star"
            aria-label="Star canalplus/rx-player on GitHub"
          >
            Star
          </a>
        </span>
        <span className="gh-button">
          <a
            className="github-button"
            href="https://github.com/canalplus/rx-player/fork"
            data-icon="octicon-repo-forked"
            aria-label="Fork canalplus/rx-player on GitHub"
          >
            Fork
          </a>
        </span>
      </section>
    </header>
  )
}
