import { useEffect, useRef } from 'react';
import css from './tabs.module.scss';

function Tabs(props) {
	const {
		listTab,
		children,
		selected,
		onChange
	} = props

	const contentContainer = useRef();

	const tabClickHandle = (item) => {
		onChange(item)
	}
	const renderClassActive = (item, selected) => {
		return item.value === selected.value ? css.active : ''
	}
	const renderTabHeader = (list) => {
		return list?.map((item, index) => {
			return (
				<div key={index} onClick={tabClickHandle.bind(null, item)} className={`${css.tabs__header__item} ${renderClassActive(item, selected)}`}>
					{item.header}
				</div>
			)
		})
	}
	const showContent = () => {
		if (!contentContainer || !contentContainer.current) {
			return;
		}
		const tabItem = contentContainer.current.querySelectorAll('div[data-tab]')

		for (const tab of tabItem) {
			const dataset = tab.dataset.tab;
			if (dataset === selected.value) {
				tab.classList.remove('d-0');
			} else if (dataset !== selected.value) {
				!tab.classList.contains('d-0') && tab.classList.add('d-0');
			}
		}
	}

	useEffect(() => {
		showContent();
	}, [selected])

	return (
		<div className={css.tabs}>
			<div className={css.tabs__header}>
				{renderTabHeader(listTab)}
				<div className={css.tabs__header__item}></div>
			</div>
			<div ref={contentContainer} className={css.tabs__content}>
				{children}
			</div>
		</div>
	)
}



export default Tabs