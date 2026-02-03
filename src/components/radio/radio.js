import React, { memo } from 'react';
import PropTypes from 'prop-types';

const changeHandler = (e, props) => {
  let value = e.target.value;
  props.onChangeFunc(value, props.name, e);

  if (!props.onValidateFunc) return;

  let msg = null;
  if (!value && props.isReq) {
    msg = `Please select ${props.title}.`;
  }

  props.onValidateFunc(msg, props.name);
};

const Radio = (props) => {
  const inputProps = {
    type: 'radio',
    name: props.name,
    className: props.className,
  };

  return (
    <div className={props.outerClassName}>
      <label className="form-label">{props.title}</label>
      <div>
        {props.options.map((x, i) => (
          <div
            key={i}
            className={`form-check${props.isVertical ? '' : ` form-check-inline`
              }`}
          >
            <input
              {...inputProps}
              id={x.value}
              value={x.value}
              onChange={(e) => changeHandler(e, props)}
            />
            <label className="form-check-label" htmlFor={x.value}>
              {x.label}
            </label>
          </div>
        ))}
      </div>
      {props.errorMsg && (
        <span className="text-danger">
          {props.errorMsg === true
            ? `Please select ${props.title}.`
            : props.errorMsg}
        </span>
      )}
    </div>
  );
};

Radio.defaultProps = {
  name: '',
  title: '',
  className: 'form-check-input',
  outerClassName: 'mb-2',
  isVertical: false,
  value: '',
  options: [],
  onChangeFunc: () => { },
  isReq: null,
  onValidateFunc: () => { },
};

Radio.propTypes = {
  name: PropTypes.string,
  title: PropTypes.string,
  className: PropTypes.string,
  outerClassName: PropTypes.string,
  isVertical: PropTypes.bool,
  value: PropTypes.any,
  options: PropTypes.array,
  onChangeFunc: PropTypes.func,
  isReq: PropTypes.bool,
  errorMsg: PropTypes.any,
  onValidateFunc: PropTypes.func,
};

export default memo(Radio);