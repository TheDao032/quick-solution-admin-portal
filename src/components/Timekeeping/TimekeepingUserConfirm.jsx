import React, { PureComponent } from 'react';
import {
  Table,
  Button
} from 'reactstrap';
// import moment from "moment";

// Util(s)
// import { mapDataOptions4Select } from 'utils/html';

// Component(s)
// ...

// Model(s)
// ...

// window._moment = moment;

/**
 * @class TimekeepingUserConfirm
 */
export default class TimekeepingUserConfirm extends PureComponent {
  constructor(props) {
    super(props);

    // Init state
    this.state = {
      /** @var {Array} */
      errors: []
    };
  }

  handleSubmit = (evt) => {
    evt.preventDefault();
    let {onSave, data = []} = this.props;
    let form = evt.target;
    let res = [];
    let errors = [];
    let pattern = /^(([0]?\d)|([1]\d)|([2][0123])):([012345]?\d):([012345]?\d)$/;
    //
    data.forEach((item, idx) => {
      let inputStartTime = form.querySelector(`input[name="start_time_${idx}"]`);
      let inputEndTime = form.querySelector(`input[name="end_time_${idx}"]`);
      let start_time = inputStartTime.value;
      let end_time = inputEndTime.value;
      //
      if (!start_time || !end_time) {
        errors[idx] = `Dữ liệu bắt buộc.`;
      } else if (!pattern.test(start_time) || !pattern.test(end_time)) {
        errors[idx] = `Dữ liệu nhập không hợp lệ.`;
      } else {
        res.push(Object.assign({}, item, { start_time, end_time }));
      }
    });

    // Render errors?!
    this.setState({ errors });

    // Fire callback?!
    (res.length && onSave) && onSave(res);
  }

  render = () => {
    let {data = []} = this.props;
    let {errors = []} = this.state;

    return data.length ? (
      <form onSubmit={this.handleSubmit} className="clearfix">
        <Table bordered striped hover>
          <thead>
            <tr>
              <th colSpan="6" className="text-center"><h5>Xác nhận chấm công nhân viên</h5></th>
            </tr>
            <tr>
              <th style={{ width: '1%' }}>#</th>
              <th>{('Mã nhân viên')}</th>
              <th>{('Tên nhân viên')}</th>
              <th>{('Ngày chấm công')}</th>
              <th>{('Giờ chấm công')}</th>
              <th style={{width:'220px'}}>
                Xác nhận chấm công <i className="text-danger">*</i>
                <br/>[hh:mm:ss] [hh:mm:ss]
              </th>
            </tr>
          </thead>
          <tbody>{(() => {
            return data.map((item, idx) => {
              let {time = ''} = item;
              time = (time + '').split('-');
              let start_time = ((time[0] || '') + '').trim();
              start_time = ('null' === start_time) ? '' : start_time;
              let end_time = ((time[1] || '') + '').trim();
              end_time = ('null' === end_time) ? '' : end_time;
              return item ? (
                <tr key={`tr-${idx}`}>
                  <th scope="row" className="text-center">{1 + idx}</th>
                  <td>{item.user_id}</td>
                  <td>{item.user_name}</td>
                  <td>{item.timekeeping}</td>
                  <td>{item.time}</td>
                  <td>
                    <div className="row">
                      <div className="col-xs-12 col-sm-6 pr-1">
                        <input
                          className="form-control input-sm text-center"
                          defaultValue={start_time}
                          placeholder="hh:mm:ss"
                          maxLength="8"
                          name={`start_time_${idx}`}
                          required
                        />
                      </div>
                      <div className="col-xs-12 col-sm-6 pl-1">
                        <input
                          className="form-control input-sm text-center"
                          defaultValue={end_time}
                          placeholder="hh:mm:ss"
                          maxLength="8"
                          name={`end_time_${idx}`}
                          required
                        />
                      </div>
                    </div>
                    {errors[idx] ? (
                      <div className="col-xs-12">
                        <span className="text-danger">{errors[idx]}</span>
                      </div>
                    ) : null}
                  </td>
                </tr>
              ) : null;
            });
          })()}</tbody>
          <tfoot>
            <tr>
              <td colSpan={6} className="text-right">
                <Button className="mr-2" color="success">Lưu</Button>
                <Button className="mr-2" onClick={this.props.onClose} color="warning">Đóng</Button>
              </td>
            </tr>
          </tfoot>
        </Table>
      </form>
    ) : null;
  };
}
