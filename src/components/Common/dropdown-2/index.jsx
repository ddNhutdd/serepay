import { useEffect, useRef, useState } from 'react';
import css from './dropdown-2.module.scss';

function Dropdown2(props) {
	const {
		header,
		option,
		onChange,
		show
	} = props;
	const headerElement = useRef(null);

	const renderOption = () => {
		return option?.map(item => {
			return (
				<div
					key={item.value}
					className={css.dropdown2__item}
					onClick={itemClickHandle.bind(null, item)}
				>
					{item.content}
				</div>
			)
		})
	}
	const itemClickHandle = (item) => {
		onChange(item);
	}
	const showMenu = show ? css.show : '';
	const dropdownClickHandle = (ev) => {
		ev.stopPropagation();
	}
	const renderTopStyle = () => {
		if (headerElement?.current?.clientHeight) {
			return headerElement?.current?.clientHeight + 3
		} else return 0;
	}

	return (
		<div onClick={dropdownClickHandle} className={css.dropdown2}>
			<div
				ref={headerElement}
			>
				{header}
			</div>
			<div
				style={{ top: renderTopStyle() }}
				className={`${css.dropdown2__menu} ${showMenu}`}
			>
				{renderOption()}
			</div>
		</div>
	)
}

export default Dropdown2