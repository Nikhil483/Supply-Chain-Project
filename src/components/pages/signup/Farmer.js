import React, { Component } from "react";
import Web3 from "web3";
import "./style.css";
import Scm from "../../../abis/Scm.json";
import { storage } from "../../Firebase";

const ipfsClient = require("ipfs-api");
const ipfs = ipfsClient({
  host: "ipfs.infura.io",
  port: 5001,
  apiPath: "/api/v0",
  protocol: "https",
});
//https://gateway.ipfs.io/ipfs/

const emailRegex = RegExp(
  /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
);

const contactRegex = RegExp(/^\d{10}$/);

const publickeyRegex = RegExp(/^[0-9A-Za-z]{42}-[a-zA-Z0-9]+$/);

const passRegex = RegExp(
  // eslint-disable-next-line no-useless-escape
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/
);

const formValid = ({ formErrors, ...rest }) => {
  let valid = true;

  // validate form errors being empty
  Object.values(formErrors).forEach((val) => {
    val.length > 0 && (valid = false);
  });

  // validate the form was filled out
  Object.values(rest).forEach((val) => {
    val === null && (valid = false);
  });

  return valid;
};

class Farmer extends Component {
  async componentWillMount() {
    await this.loadWeb3();
    await this.loadBlockchainData();
    /*<div>
        <h1> login </h1>
        <Link
          to={{
            pathname: path,
          }}
        >
          <button>submit</button>
        </Link>
        </div>*/
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    } else {
      window.alert(
        "Non-Ethereum browser detected. You should consider trying MetaMask!"
      );
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3;
    console.log("web3:", web3);
    const accounts = await web3.eth.getAccounts();
    this.setState({ account: accounts[0] });
    const networkId = await web3.eth.net.getId();
    const networkData = Scm.networks[networkId];
    if (networkData) {
      const contract = web3.eth.Contract(Scm.abi, networkData.address);
      this.setState({ contract });
    } else {
      window.alert("Smart contract not deployed to detected network.");
    }
  }

  constructor(props) {
    super(props);

    this.state = {
      firstName: null,
      lastName: null,
      email: null,
      password: null,
      contactno: null,
      publickey: null,
      address: null,
      role: "Farmer",
      verified: "not verified",
      image: null,
      progress: 0,
      url: "",
      formErrors: {
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        contactno: "",
        publickey: "",
        address: "",
      },
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.setProgress = this.setProgress.bind(this);
    this.setUrl = this.setUrl.bind(this);
    this.captureFile = this.captureFile.bind(this);
  }

  handleSubmit = (e) => {
    e.preventDefault();
    console.log(`--SUBMITTING-- : `);
    this.state.contract.methods.get_usernames
      .call({ from: this.state.account })
      .then((r) => {
        console.log("User  :", r, "length", r.length);
        if (formValid(this.state)) {
          let ret = true;
          console.log(this.state.publickey);
          // eslint-disable-next-line array-callback-return
          r.map((item) => {
            if (this.state.publickey === item) {
              ret = false;
            }
          });
          if (ret) {
            let signup_info = {
              First_Name: this.state.firstName,
              Last_Name: this.state.lastName,
              Address: this.state.address,
              Email: this.state.email,
              Password: this.state.password,
              ContactNo: this.state.contactno,
              PublicKey: this.state.publickey,
              Role: this.state.role,
              Verified: this.state.verified,
              Document: this.state.url,
            };
            console.log("Signup info:  ", signup_info);
            let signup_string = JSON.stringify(signup_info);

            let ipfs_sign_up = Buffer(signup_string);
            console.log("Submitting file to ipfs...");

            ipfs.add(ipfs_sign_up, (error, result) => {
              console.log("Ipfs result", result);
              if (error) {
                console.error(error);
                return;
              } else {
                console.log("sending hash to contract");
                this.state.contract.methods
                  .set_signup(this.state.publickey, result[0].hash)
                  .send({ from: this.state.account });
              }
            });
          } else {
            alert("Username Already exits, please choose new one");
          }
        } else {
          console.error("FORM INVALID - DISPLAY ERROR MESSAGE");
          alert("Please fill all the fields");
        }
      });
  };

  handleChange = (e) => {
    e.preventDefault();
    const { name, value } = e.target;
    let formErrors = { ...this.state.formErrors };

    switch (name) {
      case "firstName":
        formErrors.firstName =
          value.length < 3 ? "minimum 3 characaters required" : "";
        break;

      case "lastName":
        formErrors.lastName =
          value.length < 1 ? "minimum 1 characaters required" : "";
        break;

      case "address":
        formErrors.address =
          value.length < 1 ? "Please enter your address" : "";
        break;

      case "document":
        formErrors.document = value.length < 1 ? "Please Upload document" : "";
        break;

      case "email":
        formErrors.email = emailRegex.test(value)
          ? ""
          : "invalid email address";
        break;

      case "contactno":
        formErrors.contactno = contactRegex.test(value)
          ? ""
          : "Exactly 10 numbers are required";
        break;

      case "publickey":
        formErrors.publickey = publickeyRegex.test(value)
          ? ""
          : "Please enter your username in the specified format";
        break;

      case "password":
        formErrors.password = passRegex.test(value)
          ? ""
          : "Use atleast one special,one numeric,one capital and atlest 8 characaters";
        break;

      default:
        break;
    }

    this.setState({ formErrors, [name]: value }, () => console.log(this.state));
  };

  setProgress = (prog) => {
    this.setState({
      progress: prog,
    });
  };

  setUrl = (link) => {
    this.setState({
      url: link,
    });
  };

  captureFile = (event) => {
    event.preventDefault();

    const file = event.target.files[0];
    console.log("image", file);
    this.setState(
      function (prevState, props) {
        return {
          image: file,
        };
      },
      () => {
        console.log("image", this.state.image);
        const uploadTask = storage
          .ref(`${this.state.role}/${this.state.image.name}`)
          .put(this.state.image);
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress = Math.round(
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            );
            this.setProgress(progress);
          },
          (error) => {
            console.log(error);
          },
          () => {
            storage
              .ref(`${this.state.role}`)
              .child(this.state.image.name)
              .getDownloadURL()
              .then((url) => {
                this.setUrl(url);
              });
          }
        );
      }
    );
  };

  render() {
    const { formErrors } = this.state;

    return (
      <div className="wrapper">
        <div className="form-wrapper">
          <h1>Create Account - Farmer </h1>
          <form onSubmit={this.handleSubmit} noValidate>
            <div className="firstName">
              <label htmlFor="firstName">First Name</label>
              <input
                className={formErrors.firstName.length > 0 ? "error" : null}
                placeholder="First Name"
                type="text"
                name="firstName"
                noValidate
                onChange={this.handleChange}
              />
              {formErrors.firstName.length > 0 && (
                <span className="errorMessage">{formErrors.firstName}</span>
              )}
            </div>
            <div className="lastName">
              <label htmlFor="lastName">Last Name</label>
              <input
                className={formErrors.lastName.length > 0 ? "error" : null}
                placeholder="Last Name"
                type="text"
                name="lastName"
                noValidate
                onChange={this.handleChange}
              />
              {formErrors.lastName.length > 0 && (
                <span className="errorMessage">{formErrors.lastName}</span>
              )}
            </div>
            <div className="email">
              <label htmlFor="email">Email</label>
              <input
                className={formErrors.email.length > 0 ? "error" : null}
                placeholder="Enter your Email"
                type="email"
                name="email"
                noValidate
                onChange={this.handleChange}
              />
              {formErrors.email.length > 0 && (
                <span className="errorMessage">{formErrors.email}</span>
              )}
            </div>
            <div className="contact_no">
              <label htmlFor="email">Contact Number</label>
              <input
                className={formErrors.contactno.length > 0 ? "error" : null}
                placeholder="Enter your 10 digit mobile number"
                type="contactno"
                name="contactno"
                noValidate
                onChange={this.handleChange}
              />
              {formErrors.contactno.length > 0 && (
                <span className="errorMessage">{formErrors.contactno}</span>
              )}
            </div>

            <div className="address">
              <label htmlFor="email">Address</label>
              <input
                className={formErrors.address.length > 0 ? "error" : null}
                placeholder="Enter your permanent adrress"
                type="text"
                name="address"
                noValidate
                onChange={this.handleChange}
              />
              {formErrors.address.length > 0 && (
                <span className="errorMessage">{formErrors.address}</span>
              )}
            </div>

            <div className="upload_doc">
              <label htmlFor="email">Upload Documents</label>
              <input type="file" onChange={this.captureFile} />
              {/*<progress value={this.state.progress} max="100" />*/}
            </div>

            <div className="publickey">
              <label htmlFor="email">Username</label>
              <input
                className={formErrors.contactno.length > 0 ? "error" : null}
                placeholder="Enter Public key-username"
                type="publickey"
                name="publickey"
                noValidate
                onChange={this.handleChange}
              />
              {formErrors.publickey.length > 0 && (
                <span className="errorMessage">{formErrors.publickey}</span>
              )}
            </div>

            <div className="format">
              <label htmlFor="email">Example</label>
              <h5>(0x4322EcbD8d43421a77Ec6F0AF0E6CA866e2A3CEd-bha123)</h5>
            </div>

            <div className="password">
              <label htmlFor="password">Password</label>
              <input
                className={formErrors.password.length > 0 ? "error" : null}
                placeholder="Password"
                type="password"
                name="password"
                noValidate
                onChange={this.handleChange}
              />
              {formErrors.password.length > 0 && (
                <span className="errorMessage">{formErrors.password}</span>
              )}
            </div>
            <div className="createAccount">
              <button type="submit">Create Account</button>
              <small>Already Have an Account?</small>
            </div>
          </form>
        </div>
      </div>
    );
  }
}

export default Farmer;