import css from "./inputFile.module.scss";
import React, { useState } from "react";

function InputFile(props) {
  const { id, image, setImage, onChange, errorMess } = props;
  const [imagePreview, setImagePreview] = useState();
  const [fileName, setFileName] = useState();

  const fileChangeHandle = ({ target: { files } }) => {
    if (files.length <= 0) return;
    files[0] && setFileName(files[0].name);
    if (files) {
      setImage(files[0]);
      setImagePreview(URL.createObjectURL(files[0]));
    }
    onChange(files);
  };
  const renderImage = () => {
    return image ? (
      <img src={imagePreview} alt="preview" />
    ) : (
      <i className="fa-solid fa-file-arrow-up"></i>
    );
  };
  const trashClickHandle = () => {
    setImage(null);
    setFileName(null);
    setImagePreview(null);
  };
  const renderFileName = () => {
    return fileName ? (
      <div className={css["fileInput__fileName"]}>
        <div>{fileName}</div>
        <div
          className={css["fileInput__fileName__trash"]}
          onClick={trashClickHandle}
        >
          <i className="fa-solid fa-trash-can"></i>
        </div>
      </div>
    ) : (
      ""
    );
  };

  return (
    <div className={css["fileInput"]}>
      <input
        onChange={fileChangeHandle}
        className="--d-none"
        id={id}
        type="file"
      ></input>
      <label htmlFor={id}>
        <div className={css["fileInput__preview"]}>{renderImage()}</div>
      </label>
      <div>{renderFileName()}</div>
      <div className={css["fileInput__error"]}>{errorMess}</div>
    </div>
  );
}

InputFile.defaultProps = {
  errorMess: "",
  onChange: () => {},
};

export default InputFile;
