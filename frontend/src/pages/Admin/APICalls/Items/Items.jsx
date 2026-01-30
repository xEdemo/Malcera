import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
	AdminDynamicTable,
	Loading,
	AdminDeleteModal,
} from "../../../../components";
import { fetchItems, deleteItem } from "../../../../slices/item/itemSlice";
import { FaPencilAlt, FaRegTrashAlt } from "react-icons/fa";
import { toast } from "react-toastify";

const Items = () => {
	const [deleteModalItem, setDeleteModalItem] = useState(null);

	const { items, loading, error } = useSelector((state) => state.item);

	const location = useLocation();
	const navigate = useNavigate();
	const dispatch = useDispatch();

	const fetch = async () => {
		try {
			const res = await dispatch(fetchItems()).unwrap();
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
			{
				label: "Name",
				accessor: "name",
				sortable: true,
			},
			{
				label: "Created By",
				accessor: "createdBy",
				sortable: false,
				Cell: (row) =>
					String(row?.createdBy?.user?.username)
						.charAt(0)
						.toUpperCase() +
					String(row?.createdBy?.user?.username).slice(1),
			},
			{
				label: "PUT",
				accessor: "edit",
				sortable: false,
				Cell: (row) => (
					<FaPencilAlt
						className="dynamic-table-icon-put"
						onClick={(e) => {
							e.stopPropagation();
							navigate(`/admin/item/${row._id}`);
						}}
					/>
				),
			},
			{
				label: "DELETE",
				accessor: "delete",
				sortable: false,
				Cell: (row) => (
					<FaRegTrashAlt
						className="dynamic-table-icon-delete"
						onClick={(e) => {
							e.stopPropagation();
							setDeleteModalItem(row);
						}}
					/>
				),
			},
		],
		[navigate]
	);

	const confirmDelete = async () => {
		try {
			await dispatch(deleteItem(deleteModalItem._id)).unwrap();
			toast.success(
				`${
					deleteModalItem?.name || deleteModalItem._id
				} was successfully deleted.`
			);
			setDeleteModalItem(null);
		} catch (err) {
			toast.error(err);
		}
	};

	const cancelDelete = () => {
		setDeleteModalItem(null);
	};

	return (
		<>
			{location.pathname === "/admin/item" && (
				<>
					<div>
						<div className="dynamic-table-header">
							<h2>Items</h2>
							<button
								type="button"
								onClick={() => navigate("/admin/item/post")}
							>
								POST
							</button>
						</div>
						<>
							{loading || !items ? (
								<Loading />
							) : (
								<AdminDynamicTable
									columns={columns}
									data={items}
								/>
							)}
						</>
					</div>
					{deleteModalItem && (
						<AdminDeleteModal
							obj={deleteModalItem}
							onConfirm={confirmDelete}
							onCancel={cancelDelete}
						/>
					)}
				</>
			)}

			<Outlet />
		</>
	);
};

export default Items;
