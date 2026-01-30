const AdminDeleteModal = ({ obj, onConfirm, onCancel }) => {
	return (
		<div className="delete-modal-overlay">
			<div className="delete-modal">
				<p>
					Are you sure you want to delete:{" "}
					{obj?.name || obj?.username || obj._id}?
				</p>
				<div className="delete-modal-buttons">
					<button className="modal-btn-confirm" onClick={onConfirm}>
						Yes
					</button>
					<button className="modal-btn-cancel" onClick={onCancel}>
						No
					</button>
				</div>
			</div>
		</div>
	);
};

export default AdminDeleteModal;