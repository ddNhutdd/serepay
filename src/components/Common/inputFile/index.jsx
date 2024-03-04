import css from "./inputFile.module.scss";

import React from "react";

function InputFile(props) {
  const { id, image, setImage } = props;

  return (
    <div className={css["fileInput"]}>
      <input id={id} type="file"></input>
      <label htmlFor={id}>
        <div className={css["fileInput__preview"]}>
          <div></div>
          <div>
            <img></img>
          </div>
        </div>
      </label>
    </div>
  );
}

export default InputFile;
