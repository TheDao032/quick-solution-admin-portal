import React from 'react';
import PropTypes from 'prop-types';
import TablePagination from '@material-ui/core/TablePagination';

function CustomPagination(props) {
  const rowsPerPageOptions = props.rowsPerPageOptions || [25, 50, 75, 100]
  const {count,page,rowsPerPage,onChangePage,onChangeRowsPerPage} = props

  return (
    <TablePagination
      rowsPerPageOptions={rowsPerPageOptions}
      component="div"
      count={count}
      rowsPerPage={rowsPerPage}
      page={page}
      labelDisplayedRows=	{({ from, to, count }) => `${from}-${to} của ${count}`}
      labelRowsPerPage="Số dòng trên trang:"
      backIconButtonProps={{
        'aria-label': 'Trang trước đó',
      }}
      nextIconButtonProps={{
        'aria-label': 'Trang tiếp theo',
      }}
      onChangePage={onChangePage}
      onChangeRowsPerPage={onChangeRowsPerPage}
    />
  )
}
CustomPagination.propTypes = {
  rowsPerPageOptions: PropTypes.array,
  count: PropTypes.number,
  rowsPerPage: PropTypes.number,
  page: PropTypes.number,
  onChangePage: PropTypes.func,
  onChangeRowsPerPage: PropTypes.func,
};

export default CustomPagination
