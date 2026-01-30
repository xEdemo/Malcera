import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
	AdminDynamicTable,
	Loading,
	AdminDeleteModal,
} from "../../../../components";
import { fetchMaps } from "../../../../slices/map/mapSlice.js";
import { toast } from "react-toastify";

const Maps = () => {
	const [deleteModalItem, setDeleteModalItem] = useState(null);

	const { maps, loading, error } = useSelector((state) => state.map);

	const location = useLocation();
	const navigate = useNavigate();
	const dispatch = useDispatch();

	const fetch = async () => {
		try {
			const res = await dispatch(fetchMaps()).unwrap();
			// console.log(res);
		} catch (err) {
			toast.error(err);
		}
	};

	useEffect(() => {
		fetch();
	}, [location.pathname]);

	const columns = useMemo(
		() => [
			{
				label: "ID",
				accessor: "_id",
				sortable: true,
			},
			{
				label: "Key",
				accessor: "key",
				sortable: true,
			},
			// {
			// 	label: "Created By",
			// 	accessor: "createdBy",
			// 	sortable: false,
			// 	Cell: (row) =>
			// 		String(row?.createdBy?.user?.username)
			// 			.charAt(0)
			// 			.toUpperCase() +
			// 		String(row?.createdBy?.user?.username).slice(1),
			// },
			// {
			// 	label: "PUT",
			// 	accessor: "edit",
			// 	sortable: false,
			// 	Cell: (row) => (
			// 		<FaPencilAlt
			// 			className="dynamic-table-icon-put"
			// 			onClick={(e) => {
			// 				e.stopPropagation();
			// 				navigate(`/admin/map/${row._id}`);
			// 			}}
			// 		/>
			// 	),
			// },
			// {
			// 	label: "DELETE",
			// 	accessor: "delete",
			// 	sortable: false,
			// 	Cell: (row) => (
			// 		<FaRegTrashAlt
			// 			className="dynamic-table-icon-delete"
			// 			onClick={(e) => {
			// 				e.stopPropagation();
			// 				setDeleteModalItem(row);
			// 			}}
			// 		/>
			// 	),
			// },
		],
		[navigate]
	);

	return (
		<>
			{location.pathname === "/admin/map" && (
				<>
					<div>
						<div className="dynamic-table-header">
							<h2>Maps</h2>
							<button
								type="button"
								onClick={() => navigate("/admin/map/post")}
							>
								POST
							</button>
						</div>
						<>
							{loading || !maps ? (
								<Loading />
							) : (
								<AdminDynamicTable
									columns={columns}
									data={maps}
								/>
							)}
						</>
					</div>
					{deleteModalItem && (
						<AdminDeleteModal
							obj={deleteModalItem}
							// onConfirm={confirmDelete}
							// onCancel={cancelDelete}
						/>
					)}
				</>
			)}
			<Outlet />
		</>
	);
};

export default Maps;
