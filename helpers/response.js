'use strict';

/* Success Response */
exports.success = (res, value, total = 0, page = 1, limit = 10) => {
  const result = {
    status: 200,
    result: value,
    total,
    page,
    limit
  };
  res.status(200).json(result);
  res.end();
};

exports.upsert = (res, data, message) => {
  const result = {
    status: 200,
    message: `data successfully ${message}`,
    data: data
  };
  res.status(200).json(result);
  res.end();
};

/* Error Response */

exports.notFound = res => {
  const result = {
    status: 404,
    message: 'No entry found'
  };
  res.status(404).json(result);
  res.end();
};

exports.falseRequirement = (res, field) => {
  const result = {
    status: 500,
    message: `invalid-${field}`
  };
  res.status(500).json(result);
  res.end();
};

exports.loginFailed = res => {
  res.status(401).send({
    status: 401,
    message: 'Incorrect username or password'
  });
};

exports.loginSuccess = (res, rows, token) => {
  res.status(200).send({
    status: 200,
    data: rows,
    token: token
  });
};

exports.invalid = (res, status) => {
  res.status(400).json({
    status: 400,
    message: 'Invalid ' + status
  });
};

exports.internalError = (res, message) => {
  res.status(500).json({
    status: 500,
    message,
  });
};

exports.error = (res, err) => {
  res.status(422).json({
    status: 422,
    message: err
  });
};
