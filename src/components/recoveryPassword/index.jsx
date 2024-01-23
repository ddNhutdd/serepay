import React, { useState } from "react";
import { useFormik } from "formik";
import { Button } from "antd";
import * as Yup from "yup";
import { callToastError, callToastSuccess } from "src/function/toast/callToast";
import { sendMailForGetPassword } from "src/util/userCallApi";

function RecoveryPassword() {
  const [loading, setLoading] = useState(false);

  const fetchApiSendEmail = function () {
    return new Promise((resolve, reject) => {
      if (loading) resolve(true);
      else setLoading(() => true);
      sendMailForGetPassword({
        email: formik.values.email,
      })
        .then((resp) => {
          callToastSuccess("email da được gửi");
        })
        .catch((error) => {
          //email khoong toonf tai
          const mes = error.response.data.message;
          switch (mes) {
            case "Email is not define":
              callToastError("Email không tồn tại trên hệ thống");
              break;

            default:
              callToastError("co loi xay ra");
              break;
          }
        })
        .finally(() => {
          setLoading(() => false);
        });
    });
  };

  const formik = useFormik({
    initialValues: {
      email: "",
    },
    validationSchema: Yup.object({
      email: Yup.string().required("Required").email("Invalid email"),
    }),
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit: (values, e) => {
      console.log("1", e);
      fetchApiSendEmail();
    },
  });

  return (
    <div className="login-register">
      <div className="container">
        <div className="box">
          <h2 className="title">Recover Password</h2>
          <form onSubmit={formik.handleSubmit}>
            <div className="field">
              <label htmlFor="email">Email: </label>
              <input
                id="email"
                name="email"
                onChange={formik.handleChange}
                value={formik.values.email}
                size="large"
              />
              {formik.errors.email ? (
                <div className="error">{formik.errors.email}</div>
              ) : null}
            </div>
            <Button
              loading={loading}
              type="primary"
              size="large"
              className="loginBtn"
              htmlType="submit"
            >
              Send
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default RecoveryPassword;
