import React, { useEffect, useState } from "react";
import "./DisperseValidator.css";
import Alert from "../Alert/Alert";

const DisperseValidator = () => {
  const [duplicate, setduplicate] = useState(false);
  const [nextButton, setNextButton] = useState(false);
  const [inputLines, setInputLines] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("");
  const [addressMap, setAddressMap] = useState(new Map());
  const [addressLineMap, setAddressLineMap] = useState(new Map());

  const updateInputBox = (text) => {
    document.getElementById("inputBox").value = text;
    updateLineNumbers();
    onSubmit();
  };

  function removeDuplicate() {
    const lines = inputLines;

    const uniqueLines = new Map();

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const parts = line.split(/[\s,=]/);

      if (!uniqueLines.has(parts[0])) {
        uniqueLines.set(parts[0], line);
      }
    }

    const updatedLines = Array.from(uniqueLines, ([key, value]) => `${value}`);
    const updatedText = updatedLines.join("\n");
    updateInputBox(updatedText);
  }

  function combineDuplicateAmount() {
    const lines = inputLines;

    const addressTotalMap = new Map();

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      const parts = line.split(/[\s,=]/);

      if (parts[0].startsWith("0x") && parts[0].length === 42) {
        const amount = parseFloat(!isNaN(parts[1]) ? parts[1] : null);
        if (amount) {
          if (addressTotalMap.has(parts[0])) {
            addressTotalMap.set(
              parts[0],
              addressTotalMap.get(parts[0]) + amount
            );
          } else {
            addressTotalMap.set(parts[0], amount);
          }
        }
      }
    }

    const combinedLines = Array.from(
      addressTotalMap,
      ([key, value]) => `${key}=${value}`
    );

    const updatedText = combinedLines.join("\n");
    updateInputBox(updatedText);
  }

  function onSubmit() {
    setNextButton(false);

    const inputBox = document.getElementById("inputBox");
    let errorMessages = document.getElementById("errorMessages");
    errorMessages.innerHTML = "";
    setAddressMap(new Map());
    setAddressLineMap(new Map());

    const errorList = document.createElement("ul");

    const lines = inputBox.value.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      let invalidAddress = false;
      let invalidAmount = false;

      const parts = line.split(/[\s,=]/);
      if (!parts[0].startsWith("0x") || parts[0].length !== 42) {
        invalidAddress = true;
      }

      if (isNaN(parts[1])) {
        invalidAmount = true;
      } else {
        if (addressMap.has(parts[0])) {
          addressMap.set(
            parts[0],
            addressMap.get(parts[0]) + parseFloat(parts[1])
          );
          addressLineMap.get(parts[0]).push(i + 1);
        } else {
          addressMap.set(parts[0], parseFloat(parts[1]));
          addressLineMap.set(parts[0], [i + 1]); // Initialize line number array
        }
      }

      if (invalidAddress && invalidAmount) {
        const errorItem = document.createElement("li");
        errorItem.textContent = `Line ${
          i + 1
        } Invalid Ethereum address and wrong amount`;
        errorList.appendChild(errorItem);
      } else if (invalidAddress) {
        const errorItem = document.createElement("li");
        errorItem.textContent = `Line ${i + 1} Invalid Ethereum address`;
        errorList.appendChild(errorItem);
      } else if (invalidAmount) {
        const errorItem = document.createElement("li");
        errorItem.textContent = `Line ${i + 1} wrong amount`;
        errorList.appendChild(errorItem);
      }
    }

    const duplicateAddresses = [];
    addressMap.forEach((total, address) => {
      if (addressLineMap.get(address).length > 1) {
        duplicateAddresses.push({
          address: address,
          lines: addressLineMap.get(address),
        });
      }
    });
    if (duplicateAddresses.length > 0) {
      duplicateAddresses.forEach((duplicate) => {
        const duplicateErrorItem = document.createElement("li");
        duplicateErrorItem.innerHTML = `${
          duplicate.address
        } duplicate in lines: ${duplicate.lines.join(", ")}`;
        errorList.appendChild(duplicateErrorItem);
      });
    }
    if (errorList.children.length > 0) {
      errorMessages.appendChild(errorList);
      showMessage("Errors: Please check the input", "error");
    } else {
      showMessage("Success: Valid Input", "success");
    }
    setduplicate(duplicateAddresses.length > 0 ? true : false);
  }
  function updateLineNumbers() {
    setNextButton(true);
    const inputBox = document.getElementById("inputBox");
    const lineNumbers = document.getElementById("lineNumbers");
    const lines = inputBox.value.split("\n");
    setInputLines([...lines]);
    lineNumbers.innerHTML = "";
    for (let i = 0; i < lines.length; i++) {
      lineNumbers.innerHTML += i + 1 + "<br>";
    }
  }
  const showMessage = (message, type) => {
    setAlertMessage(message);
    setAlertType(type);
    setShowAlert(true);

    setTimeout(() => {
      setShowAlert(false);
    }, 5000);
  };

  return (
    <div className="container">
      {showAlert && <Alert message={alertMessage} type={alertType} />}
      <div className="validator">
        <div className="title">
          <p>Addresses with amount</p>
          <p>Upload file</p>
        </div>
        <div className="editorbox">
          <div id="lineNumbers"></div>
          <textarea
            id="inputBox"
            rows="20"
            cols="50"
            placeholder=""
            onChange={() => updateLineNumbers()}
          ></textarea>
        </div>
        <div className="title guidelies">
          <p>Seperated by ',' or ' ' or '='</p>
          <p>Show example</p>
        </div>
        {duplicate && (
          <div className="title duplicate">
            <p>Duplicated</p>
            <div className="btn">
              <button onClick={() => removeDuplicate()}>
                Keep the first one
              </button>
              <span>|</span>
              <button onClick={() => combineDuplicateAmount()}>
                Combine balance
              </button>
            </div>
          </div>
        )}
        <div id="errorMessages"></div>

        <button
          className={nextButton ? "active nextButton" : "nextButton"}
          onClick={() => {
            if (nextButton) {
              onSubmit();
            }
          }}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default DisperseValidator;
