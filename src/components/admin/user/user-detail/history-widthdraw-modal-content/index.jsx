import { EmptyCustom } from 'src/components/Common/Empty';
import css from './history-widthdraw-modal-content.module.scss';
import { Pagination, Spin } from 'antd';
import WidthdrawRecord from './widthdraw-record';
import { useEffect, useRef, useState } from 'react';
import { api_status } from 'src/constant';
import { getWalletToWithdrawWhere } from 'src/util/adminCallApi';
import { useParams } from 'react-router-dom';

function HistoryWidthdrawModalContent() {

  // lấy userid từ url
  const {
    userid
  } = useParams();
  const [id] = userid.split('_')



  // phần phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(1);
  const limit = useRef(10);
  const pageChangeHandle = (page) => {
    fetchMainData(page);
  }






  // phần main data
  const [callApiStatus, setCallApiStatus] = useState(api_status.pending);
  const [mainData, setMainData] = useState([]);
  const fetchMainData = async (page) => {
    try {
      if (callApiStatus === api_status.fetching) {
        setCallApiStatus(api_status.fetching)
      }
      setCallApiStatus(api_status.fetching)

      const resp = await getWalletToWithdrawWhere({
        limit: limit.current,
        page,
        where: `user_id=${id}`
      });
      const { array, total } = resp?.data?.data;
      setMainData(array);
      setTotalItems(total);
      setCurrentPage(page)
      setCallApiStatus(api_status.fulfilled)
    } catch (error) {
      setCallApiStatus(api_status.rejected)
    }
  }








  // render table
  const renderMainData = (mainData) => {
    return mainData?.map(item => {
      return (
        <WidthdrawRecord key={item.id} content={item} />
      )
    })
  }
  const renderLoading = () => {
    return callApiStatus === api_status.fetching ? '' : '--d-none';
  }
  const renderContent = () => {
    return callApiStatus !== api_status.fetching && mainData && mainData?.length > 0 ? '' : '--d-none';
  }
  const renderEmpty = () => {
    return callApiStatus !== api_status.fetching && (!mainData || mainData?.length) <= 0 ? '' : '--d-none';
  }








  // useEffect
  useEffect(() => {
    fetchMainData(1);
  }, [])



  return (
    <div className={css.historyWidthdrawModalContent}>
      <div
        className={`
          ${css.historyWidthdrawModalContent__content}
          ${renderContent()}
        `}
      >
        {renderMainData(mainData)}
      </div>
      <div className={renderEmpty()}>
        <EmptyCustom />
      </div>
      <div className={renderLoading()}>
        <Spin />
      </div>
      <div className={css.historyWidthdrawModalContent__paging}>
        <Pagination
          current={currentPage}
          onChange={pageChangeHandle}
          total={totalItems}
          showSizeChanger={false}
        />
      </div>
    </div>
  )
}

export default HistoryWidthdrawModalContent