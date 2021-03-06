import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Investor.css";

function InvestorNavbar(props) {
  // const [click, setClick] = useState(false);

  // const closeMobileMenu = () => setClick(false);
  // const handleClick = () => setClick(!click);
  // console.log("======="+props.publicKey);
  // return (
  //   <>
  //     <nav className="navbar_home">
  //       <div className="textColor"> Welcome to Investor {props.username}</div>
        

  //       <div className="menu-icon_home" onClick={handleClick}>
  //         <i className={click ? "fas fa-times_home" : "fas fa-bars_home"} />
  //       </div>

  //       <ul className={click ? "nav-menu_home active" : "nav-menu_home"}>
  //       <li className="nav-item_home">
  //           <Link
            
  //             to={"/UnfundedCrops/"+props.publickey}
  //             className="nav-links_farmer"
  //             onClick={closeMobileMenu}
  //           >
  //             View Unfunded_Crops
  //           </Link>
  //         </li>
  //         <li className="nav-item_home">
  //           <Link
  //             to={"/ActiveFunding/"+props.publickey}
  //             className="nav-links_farmer"
  //             onClick={closeMobileMenu}
  //           >

  //             Active Funding
  //           </Link>
  //         </li>
  //         <li className="nav-item_home">
  //           <Link
  //             to={"/"}
  //             className="nav-links_farmer"
  //             onClick={closeMobileMenu}
  //           >
  //             logout
  //           </Link>
  //         </li>
  //         {/* <li className="nav-item_home">
  //           <Link
  //              to={"/Xyz/"+props.publickey}
  //             className="nav-links_farmer"
  //             onClick={closeMobileMenu}
  //           >
  //             Xyz
  //           </Link>
  //         </li> */}
  //       </ul>
  //     </nav>
  //   </>
  // );

  const [click, setClick] = useState(false);

  const closeMobileMenu = () => setClick(false);
  const handleClick = () => setClick(!click);
  console.log(props.publicKey);

  return (
    <>
      <nav className="navbar_home">
        <div className="textColor"> Welcome {props.username}</div>
        

        <div className="menu-icon_home" onClick={handleClick}>
          <i className={click ? "fas fa-times_home" : "fas fa-bars_home"} />
        </div>

        <ul className={click ? "nav-menu_farmer active" : "nav-menu_farmer"}>
        <li className="nav-item_home">
            <Link
              to={"/UnFundedCrops/"+props.publicKey}
              className="nav-links_farmer"
              onClick={closeMobileMenu}
            >
              UnfundedCrops
            </Link>
          </li>
          <li className="nav-item_home">
            <Link
              to={"/ActiveFunding/"+props.publicKey}
              className="nav-links_farmer"
              onClick={closeMobileMenu}
            >
              ActiveFunding
            </Link>
          </li>
          {/* <li className="nav-item_home">
            <Link
              to={"/ApproveCrops/"+props.publicKey}
              className="nav-links_farmer"
              onClick={closeMobileMenu}
            >
              Finalize
            </Link>
          </li>
          <li className="nav-item_home">
            <Link
              to={"/CropsStatus/"+props.publicKey}
              className="nav-links_farmer"
              onClick={closeMobileMenu}
            >
              Crops Status
            </Link>
          </li>
          <li className="nav-item_home">
            
            <Link
              to={"/SecurityDeposit/"+props.publicKey}
              className="nav-links_farmer"
              onClick={closeMobileMenu}
            >
              Security Deposit
            </Link>
          </li> */}
          <li className="nav-item_home">
            <Link
              to={"/"}
              className="nav-links_farmer"
              onClick={closeMobileMenu}
            >
              logout
            </Link>
          </li>
        </ul>
      </nav>
    </>
  );
}

export default InvestorNavbar;
