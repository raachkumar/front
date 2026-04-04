import React, { useState, useEffect } from 'react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Alert from '@material-ui/lab/Alert';
import IconButton from '@material-ui/core/IconButton';
import Collapse from '@material-ui/core/Collapse';
import CloseIcon from '@material-ui/icons/Close';

import swal from 'sweetalert';
import axios from 'axios';
import { API_URL, APP_URL, APP_CHECKER, APP_ID } from '../config.json';
import socketIOClient from 'socket.io-client';
import { useHistory } from 'react-router-dom';

function Copyright() {
  return (
    <Typography
      variant="body2"
      color="textSecondary"
      align="center"
      style={{
        textAlign: 'center',
        fontWeight: 'bold',
        color: 'rgb(10 68 62)',
        fontStyle: 'italic',
        fontSize: '14px'
      }}
    >
      {'Powered By '}
      <Link color="inherit" target="_blank" href="http://aacp.co.in">
        AACP PRECAST
      </Link>
    </Typography>
  );
}

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main
  },
  submit: {
    margin: theme.spacing(3, 0, 2)
  }
}));

const SignIn = () => {
  const classes = useStyles();
  const history = useHistory();

  const [formValues, formSetValues] = useState({
    user_name: '',
    user_password: ''
  });

  const [ajaxReqStatus, ajaxReqStatusSet] = useState(false);
  const [open, setOpen] = useState(false);
  const [institution, institutionSet] = useState(null);

  const userNameRef = React.useRef(null);
  const userPassRef = React.useRef(null);

  useEffect(() => {
    const socket = socketIOClient("https://back-production-c227.up.railway.app");

    socket.on('connect', () => {
      setOpen(false);
    });

    socket.on('connect_error', () => {
      setOpen(true);
    });

    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    axios.get(`${API_URL}/public/get-institution`)
      .then(res => {
        institutionSet(res.data);
      })
      .catch(err => {
        console.log(err);
      });
  }, []);

  const signinAction = async () => {
    if (formValues.user_name === '') {
      swal({
        title: 'Username is required.',
        icon: 'warning'
      });
      return;
    }

    if (formValues.user_password === '') {
      swal({
        title: 'Password is required.',
        icon: 'warning'
      });
      return;
    }

    if (formValues.user_password.length < 6) {
      swal({
        title: 'Password should be minimum 6 characters',
        icon: 'warning'
      });
      return;
    }

    ajaxReqStatusSet(true);

    let status = 'YES';

    try {
      if (APP_ID !== 'lifetime') {
        const check = await axios.post(`${API_URL}/${APP_CHECKER}`, {
          appId: APP_ID
        });

        if (check.data.active === 'NO') {
          status = 'NO';
        }
      }

      if (status === 'NO') {
        ajaxReqStatusSet(false);
        swal({
          title: 'Plz Pay Your Bill... 01749-508007',
          icon: 'warning'
        });
        return;
      }

      console.log(formValues);

      const res = await axios.post(`${API_URL}/public/signin`, formValues);

      ajaxReqStatusSet(false);

      if (res.data.error === false) {
        sessionStorage.setItem('auth_info', JSON.stringify(res.data));
        window.location.href = `${APP_URL}dashboard`;
      } else {
        swal({
          title: res.data.message,
          icon: 'warning'
        });
      }

    } catch (err) {
      ajaxReqStatusSet(false);

      console.log(err.response?.data || err.message);

      swal({
        title: 'Signin failed',
        text: err.response?.data?.message || 'Server error',
        icon: 'error'
      });
    }
  };

  const handleFromInput = (e) => {
    const { name, value } = e.target;
    formSetValues({
      ...formValues,
      [name]: value
    });
  };

  return (
    <>
      <CssBaseline />

      <Grid container>
        <Grid item xs={12} sm={3}></Grid>

        <Grid
          item
          xs={12}
          sm={2}
          style={{
            marginTop: '124px',
            background: '#e0f7fa',
            textAlign: 'center',
            padding: '6px',
            border: '1px dotted #94e0d8',
            marginRight: '10px'
          }}
        >
          <img
            alt="Logo Loading..."
            src={`${API_URL}/${institution !== null ? institution.pro_logo : ''}`}
            style={{
              width: '100%',
              height: '95px',
              borderRadius: '10px'
            }}
          />

          <h4 style={{ margin: 0, padding: 0, color: '#222' }}>
            {institution !== null ? institution.pro_name : ''}
          </h4>

          <p style={{ fontStyle: 'italic', color: '#222' }}>
            {institution !== null ? institution.pro_desc : ''}
          </p>
        </Grid>

        <Grid item xs={12} sm={3}>
          <div className={classes.paper}>
            <Avatar className={classes.avatar}>
              <LockOutlinedIcon />
            </Avatar>

            <Typography component="h1" variant="h5">
              AACP PRECAST ERP
            </Typography>

            <Collapse in={open}>
              <Alert
                severity="error"
                action={
                  <IconButton
                    size="small"
                    color="inherit"
                    onClick={() => setOpen(false)}
                  >
                    <CloseIcon fontSize="inherit" />
                  </IconButton>
                }
              >
                Oops !! no internet connection
              </Alert>
            </Collapse>

            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              label="User Name"
              name="user_name"
              autoComplete="off"
              inputRef={userNameRef}
              onChange={handleFromInput}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  userPassRef.current.focus();
                }
              }}
            />

            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              name="user_password"
              label="Password"
              type="password"
              autoComplete="off"
              inputRef={userPassRef}
              onChange={handleFromInput}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  signinAction();
                }
              }}
            />

            <Button
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submit}
              disabled={ajaxReqStatus}
              onClick={signinAction}
            >
              Sign In
            </Button>

            <Grid container>
              <Grid item xs>
                <Link href="#" variant="body2">
                  Forgot password
                </Link>
              </Grid>
            </Grid>
          </div>
        </Grid>

        <Grid item xs={12} sm={4}></Grid>
      </Grid>

      <Box mt={8}>
        <Copyright />
      </Box>
    </>
  );
};

export default SignIn;
