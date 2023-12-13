import { ReactComponent as Logo } from "../src/assets/logo.svg";
import Connect from "./Connect";

import Mint from "./Mint";
const Content = () => {
  return (
    <div className="content">
      <div className="logo-cont">
        <div className="logo">
          <div className="row">
            <span>DARKNEZZ.</span>
            <Logo />
          </div>
          <Connect />
          <Mint />
        </div>
      </div>
      <div className="text">
        <div>555 darknezz come from darkness</div>
        <span> on ethscriptions by alperaym</span>
        <div>designer : alperaym.eth manager : elsvastika.eth</div>
        <div>
          Inspired by cryptopunks, 555 darknezz skulls have already become a
          part of this culture!
        </div>
      </div>
    </div>
  );
};
export default Content;
