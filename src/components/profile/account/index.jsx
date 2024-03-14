import React, { useEffect } from 'react';
import css from './account.module.scss';
import { Button } from 'src/components/Common/Button';
import { api_status, defaultLanguage, image_domain, localStorageVariable } from 'src/constant';
import { useState } from 'react';
import { ModalConfirm } from 'src/components/Common/ModalConfirm';
import i18n from 'src/translation/i18n';
import { useTranslation } from 'react-i18next';
import { getLocalStorage } from 'src/util/common';
import { Input } from 'src/components/Common/Input';
import { Spin } from 'antd';

export default function Account() {
    const { t } = useTranslation();

    const [fetchApiAddAccountStatus, setFetchApiAddAccountStatus] = useState(api_status.pending);
    const [isShowModalAddAccount, setIsShowModalAddAccount] = useState(false);
    const [mainData, setMainData] = useState([{
        id: '1',
        account: 'account1',
        address: '0x4f65ew4qr1fd3f1adr4ew+q4rereqwre1d1f1a',
        usdt: '50'
    },
    {
        id: '2',
        account: 'account1',
        address: '0x4f65ew4qr1fd3f1adr4ew+q4rereqwre1d1f1a',
        usdt: '50'
    }])
    const [currentAccount, setCurrentAccount] = useState(mainData[1]);

    const addAccount = () => {
        console.log('add account');
    }
    const openModalAddAccount = () => {
        setIsShowModalAddAccount(true)
    }
    const closeModalAddAccount = () => {
        setIsShowModalAddAccount(false);
    }
    const renderTable = () => {
        const renderActive = (item) => {
            return item === currentAccount ? css.active : '';
        }
        const itemCLickHandle = () => {
            console.log('itemClickhandle');
        }

        return mainData.map(item => (<div onClick={itemCLickHandle} key={item.id} className={`${css.account__item} ${renderActive(item)}`}>
            <div className={css.account__section}>{item.account}</div>
            <div className={css.account__section}>{item.address}</div>
            <div className={css.account__section}>
                <img src={image_domain} alt="USDT" />
                {item.usdt} USDT
            </div>
        </div>))
    }
    const renderSpin = () => {
        return fetchApiAddAccountStatus === api_status.fetching ? '' : '--d-none';
    }

    useEffect(() => {
        const language =
            getLocalStorage(localStorageVariable.lng) || defaultLanguage;
        i18n.changeLanguage(language);
    }, [])

    return (
        <div className={css.account}>
            <div className={css.account__add}>
                <Button onClick={openModalAddAccount}>{t('addAccount')}</Button>
            </div>
            <div className={css.account__list}>
                {renderTable()}
                <div className={`spin-container ${renderSpin()}`}>
                    <Spin />
                </div>
            </div>
            <ModalConfirm
                title={t('addAccount')}
                content={<ModalAddAccountContent />}
                buttonOkText={t('ok')}
                buttonCancelText={t('cancel')}
                modalConfirmHandle={addAccount}
                waiting={fetchApiAddAccountStatus}
                closeModalHandle={closeModalAddAccount}
                isShowModal={isShowModalAddAccount}
            />
        </div>
    )
}

function ModalAddAccountContent() {
    const { t } = useTranslation();

    useEffect(() => {
        const language =
            getLocalStorage(localStorageVariable.lng) || defaultLanguage;
        i18n.changeLanguage(language);
    }, [])

    return (<>
        <div className={css.modalAddAccount}>
            <label htmlFor="accountName">{t('accountName')}</label>
            <Input id="accountName" placeholder={t('accountName')} />
        </div>
    </>)
}
