import { Spin } from "antd";
import React, { useEffect, useState, useRef } from "react";
import { adminPermision, api_status } from "src/constant";
import { getConfigAdmin, updateConfigAdmin } from "src/util/adminCallApi";
import Row from "./row";
import NoPermision from "../no-permision";
import { getAdminPermision } from "src/redux/reducers/admin-permision.slice";
import { useSelector } from "react-redux";
import { analysisAdminPermision } from "src/util/common";
import { adminFunction } from "../sidebar";

function ConfigData() {

	// phần kiểm tra quyền của admin
	const { permision } = useSelector(getAdminPermision);
	const currentPagePermision = analysisAdminPermision(adminFunction.config, permision);





	const [loadMainDataStatus, setLoadMainDataStatus] = useState(
		api_status.pending
	);
	const [mainData, setMainData] = useState([]);

	const listKey = useRef(["privateKeyBNB", "addressBNB", "addressUSDT", "privateKeyTransferUSDT", "addressTransferUSDT"]);

	const renderClassShowMainData = function () {
		return loadMainDataStatus === api_status.fetching ? "--d-none" : "";
	};
	const renderClassSpinTable = function () {
		return loadMainDataStatus === api_status.fetching ? "" : "--d-none";
	};
	const fetchApiLoadMainData = function () {
		return new Promise((resolve, reject) => {
			if (loadMainDataStatus === api_status.fetching) resolve(true);
			setLoadMainDataStatus(() => api_status.fetching);
			getConfigAdmin()
				.then((resp) => {
					const listData = resp.data.data.filter(
						(item) =>
							item.name === listKey.current.at(0) ||
							item.name === listKey.current.at(1) ||
							item.name === listKey.current.at(2) ||
							item.name === listKey.current.at(3) ||
							item.name === listKey.current.at(4)
					);
					const result = listData.map((item) => ({
						...item,
						["fetching"]: false,
					}));
					setMainData(() => result);
					setLoadMainDataStatus(() => api_status.fulfilled);
				})
				.catch((error) => {
					setLoadMainDataStatus(() => api_status.rejected);
				});
		});
	};
	const renderTable = function () {
		if (!mainData || mainData.length <= 0) return;
		return mainData.map((item) => (
			<Row
				key={item.name}
				name={item.name}
				note={item.note}
			/>
		));
	};

	useEffect(() => {
		fetchApiLoadMainData();
	}, []);



	if (currentPagePermision === adminPermision.noPermision) {
		return (
			<NoPermision />
		)
	}




	return (
		<div className="configData">
			<div className="configData__header">
				<div className="configData__title">Config data</div>
			</div>
			<div className="configData__content">
				<table>
					<thead>
						<tr>
							<th>Name</th>
							<th>Note</th>
							{
								currentPagePermision === adminPermision.edit && <th>Action</th>
							}
						</tr>
					</thead>
					<tbody className={renderClassShowMainData()}>{renderTable()}</tbody>
					<tbody className={renderClassSpinTable()}>
						<tr>
							<td colSpan={3}>
								<div className="spin-container">
									<Spin />
								</div>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
	);
}

export default ConfigData;
