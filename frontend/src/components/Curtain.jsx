import React from "react";
import "./Curtain.css";

export default function Curtain({ phase }) {
  // phase: 'idle' | 'closing' | 'opening'
  return (
    <>
      <div className={`curtain curtain-left ${phase}`} />
      <div className={`curtain curtain-right ${phase}`} />
    </>
  );
}