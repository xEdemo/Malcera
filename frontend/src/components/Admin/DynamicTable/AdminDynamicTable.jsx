import { useState, useMemo, Fragment } from "react";

const AdminDynamicTable = ({ columns, data }) => {
	const [sortConfig, setSortConfig] = useState(null);
	const [currentPage, setCurrentPage] = useState(1);
	const [rowsPerPage, setRowsPerPage] = useState(10);
	const [expandedRowId, setExpandedRowId] = useState(null);

	const sortedData = useMemo(() => {
		if (!sortConfig) return data;
		const sorted = [...data].sort((a, b) => {
			let aValue = a[sortConfig.key];
			let bValue = b[sortConfig.key];

			if (typeof aValue === "string") {
				aValue = aValue.toLowerCase();
				bValue = bValue.toLowerCase();
			}
			if (aValue < bValue)
				return sortConfig.direction === "ascending" ? -1 : 1;
			if (aValue > bValue)
				return sortConfig.direction === "ascending" ? 1 : -1;
			return 0;
		});
		return sorted;
	}, [data, sortConfig]);

	const totalPages = Math.ceil(sortedData.length / rowsPerPage);
	const currentData = sortedData.slice(
		(currentPage - 1) * rowsPerPage,
		currentPage * rowsPerPage
	);

	const handleSort = (columnKey) => {
		if (sortConfig && sortConfig.key === columnKey) {
			if (sortConfig.direction === "ascending") {
				setSortConfig({ key: columnKey, direction: "descending" });
			} else if (sortConfig.direction === "descending") {
				setSortConfig(null);
			}
		} else {
			setSortConfig({ key: columnKey, direction: "ascending" });
		}
	};

	const toggleExpandedRow = (row) => {
		setExpandedRowId(expandedRowId === row._id ? null : row._id);
	};

	return (
		<div>
			<table className="dynamic-table">
				<thead>
					<tr>
						{columns.map((col, index) => (
							<th
								key={index}
								onClick={() =>
									col.sortable && handleSort(col.accessor)
								}
								style={{
									cursor: col.sortable
										? "pointer"
										: "default",
								}}
							>
								{col.label}
								{col.sortable &&
									sortConfig &&
									sortConfig.key === col.accessor && (
										<span>
											{sortConfig.direction ===
											"ascending"
												? " ▲"
												: " ▼"}
										</span>
									)}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{currentData.map((row, rowIndex) => (
						<Fragment key={row._id || rowIndex}>
							<tr
								onClick={() => toggleExpandedRow(row)}
								style={{ cursor: "pointer" }}
							>
								{columns.map((col, colIndex) => (
									<td key={colIndex}>
										{col.Cell
											? col.Cell(row)
											: row[col.accessor]}
									</td>
								))}
							</tr>
							{expandedRowId === row._id && (
								<tr>
									<td colSpan={columns?.length}>
										<div
											className="dynamic-table-json"
											style={{
												maxHeight: "400px",
												fontFamily: "monospace",
												whiteSpace: "pre-wrap",
												overflowY: "auto",
											}}
										>
											{JSON.stringify(row, null, 2)}
										</div>
									</td>
								</tr>
							)}
						</Fragment>
					))}
				</tbody>
			</table>
			<div className="dynamic-table-footer">
				<div style={{ width: `127.27px` }}></div>
				<div className="dynamic-table-pagination">
					<button
						type="button"
						disabled={currentPage === 1}
						onClick={() => setCurrentPage((prev) => prev - 1)}
					>
						&#8592;
					</button>
					<p>
						Page {currentPage} of {totalPages}
					</p>
					<button
						type="button"
						onClick={() => setCurrentPage((prev) => prev + 1)}
						disabled={currentPage >= totalPages ? true : false}
					>
						&#8594;
					</button>
				</div>
				<div className="dynamic-table-page-number">
					<label htmlFor="rowsPerPage">Rows Per Page:</label>
					<input
						type="number"
						id="rowsPerPage"
						value={
							data.length < rowsPerPage
								? data.length
								: rowsPerPage
						}
						min={1}
						max={100}
						onChange={(e) => {
							const inputValue = e.target.value;
							if (
								inputValue === "" ||
								inputValue.match(/^0+\d*$/) ||
								inputValue.match(/^\d+$/)
							) {
								setCurrentPage(1);
								setRowsPerPage(inputValue);
							}
						}}
					/>
				</div>
			</div>
		</div>
	);
};

export default AdminDynamicTable;
