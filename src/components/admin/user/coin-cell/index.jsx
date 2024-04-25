import { useEffect, useState } from "react";
import { currencyMapper } from "src/constant";
import { getWalletToUserAdmin } from "src/util/adminCallApi";
import { formatNumber } from "src/util/common";

function CoinCells(props) {
  const {
    id,
    listCoinName
  } = props;

  const [list, setList] = useState(listCoinName?.map(item => {
    return (
      <td>
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
      listCoinName.map(coinName => {
        const coinNameBalance = (coinName.name + '_balance').toLowerCase(); 
        result.push(
          <td>
            { resp?.data?.data[coinNameBalance] ? formatNumber(resp?.data?.data[coinNameBalance], currencyMapper.USD, 8) : 0}
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