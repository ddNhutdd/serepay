import CopyButton from "src/components/Common/copy-button"
import css from './transfer-record.module.scss'
import { formatNumber, shortenHash } from "src/util/common";
import { image_domain } from "src/constant";
import { availableLanguage } from "src/translation/i18n";

function TransferRecord(props) {
  const {
    content
  } = props;
  console.log(content)

  return (
    <div className={css.transferRecord}>
      <div>
        {content?.created_at}
      </div>
      <div className={css.transferRecord__address}>
        <span>From:</span> {shortenHash(content?.address_form)}
        <CopyButton value={content?.address_form} />
      </div>
      <div className={css.transferRecord__address}>
        <span>To:</span> {shortenHash(content?.address_to)}
        <CopyButton value={content?.address_to} />
      </div>
      <div className={css.transferRecord__amount}>
        <img src={image_domain.replace("USDT", content?.coin_key?.toUpperCase())} alt={content?.coin_key} />
        {
          formatNumber(content?.amount, availableLanguage.en, 8)
        }
      </div>
      <div className={css.transferRecord__note}>
        {content?.note}
      </div>
    </div>
  )
}

export default TransferRecord