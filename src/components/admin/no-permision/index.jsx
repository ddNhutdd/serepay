import { useSelector } from "react-redux";
import { getAdminPermision } from "src/redux/reducers/admin-permision.slice";
function NoPermision() {

	const { authenticating } = useSelector(getAdminPermision);

	return (
		<div className="adminUser">
			<div className="row">
				<div className="col-12 px-0 pt-0 adminUser__tittle" style={{ fontSize: 16 }}>
					{
						authenticating ?
							'Authenticating' :
							'No Permision'
					}
				</div>
			</div>
		</div>
	)
}

export default NoPermision