import { useEffect, useState } from "react";
import { currencyMapper, image_domain } from "src/constant";
import { getWalletToUserAdmin } from "src/util/adminCallApi";
import { formatNumber, rountRange } from "src/util/common";
import css from './coin-cell.module.scss';
import { availableLanguage } from "src/translation/i18n";

function CoinCells(props) {
  const {
    id,
    listCoinName,
    listCoin
  } = props;

  const [list, setList] = useState(listCoinName?.map(item => {
    return (
      <td key={item.id}>
        pending
      </td>
    )
  }));

  const fetchUserCoin = async () => {
    try {
      const resp = await getWalletToUserAdmin({
        userid: id
      });
      const result = [];
      listCoinName.map((coinName) => {

        const coinNameBalance = (coinName.name + '_balance').toLowerCase();
        result.push(
          <td key={coinName.name}>
            <div className={css.coinCells}>
              <img src={image_domain.replace("USDT", coinName.name)} />
              {" "}
              {resp?.data?.data[coinNameBalance] ? formatNumber(resp?.data?.data[coinNameBalance], availableLanguage.en, rountRange(
                listCoin?.find((coin) => coin?.name === coinName?.name?.toUpperCase())
                  ?.price || 10000
              )) : 0}
            </div>
          </td>
        )
      })

      setList(result)
    } catch (error) {
    }
  }
  useEffect(() => {
    fetchUserCoin();
  }, [id])
  return (
    <>
      {list}
    </>
  )
}

export default CoinCells