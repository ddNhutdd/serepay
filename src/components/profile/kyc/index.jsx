import React, { useEffect } from "react";
import css from "./kyc.module.scss";
import { getLocalStorage } from "src/util/common";
import { defaultLanguage, localStorageVariable } from "src/constant";
import i18n from "src/translation/i18n";
import { useTranslation } from "react-i18next";
import { Input } from "src/components/Common/Input";
import { Button } from "src/components/Common/Button";
import InputFile from "src/components/Common/inputFile";

function Kyc(props) {
  const { typeKyc, userid } = props;

  const { t } = useTranslation();

  useEffect(() => {
    const language =
      getLocalStorage(localStorageVariable.lng) || defaultLanguage;
    i18n.changeLanguage(language);
  }, []);
  return (
    <div className={css["kyc"]}>
      <div className={css["kyc__verfifing"]}>
        <div>{t("pleaseWaitForAdminConfirmation")}</div>
      </div>

      <form className={css["kyc__form"]}>
        <div className={css["kyc__infoContainer"]}>
          <div className={css["kyc__input"]}>
            <label htmlFor="kycFullname">{t("fullName")}</label>
            <Input id={"kycFullname"} />
          </div>
          <div className={css["kyc__input"]}>
            <label htmlFor="kycPhone">{t("phone")}</label>
            <Input id={"kycPhone"} />
          </div>
          <div className={css["kyc__input"]}>
            <label htmlFor="kycAddress">{t("address")}</label>
            <Input id={"kycAddress"} />
          </div>
          <div className={css["kyc__input"]}>
            <label htmlFor="kycCompany">{t("company")}</label>
            <Input id={"kycCompany"} />
          </div>
          <div className={css["kyc__input"]}>
            <label htmlFor="kycPassport">{t("passport")}</label>
            <Input id={"kycCokycPassportmpany"} />
          </div>
        </div>
        <div className={css["kyc__fileContainer"]}>
          <div>
            <InputFile id={"1"}></InputFile>
          </div>
          <div>
            <InputFile id={"2"}></InputFile>
          </div>
          <div>
            <InputFile id={"3"}></InputFile>
          </div>
        </div>
        <div className={css["kyc__action"]}>
          <Button>{t("send")}</Button>
        </div>
      </form>
    </div>
  );
}

export default Kyc;
