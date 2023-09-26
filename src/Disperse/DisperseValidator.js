import React, { useEffect, useState } from "react";
import "./DisperseValidator.css";

const DisperseValidator = () => {
  const [duplicate, setduplicate] = useState(false);
  const [inputLines, setInputLines] = useState("");

  const [addressMap, setAddressMap] = useState(new Map());
  const [addressLineMap, setAddressLineMap] = useState(new Map());

  function removeDuplicate(callBack) {
    // Split the input into lines
    const lines = inputLines;
  
    // Create a set to store unique lines
    const uniqueLines = new Map();
  
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const parts = line.split(/[\s,=]/);
  
      // Add the first occurrence of each address to the set
      if (!uniqueLines.has(parts[0])) {
          uniqueLines.set(parts[0],line);
      }
    }
  
    // Convert the set back to an array
    const updatedLines = Array.from(uniqueLines, ([key,value]) => `${value}`);
    // Update the input box text
    const updatedText = updatedLines.join("\n");
    document.getElementById("inputBox").value = updatedText;
    updateLineNumbers();
    callBack();
  }
 

  function combineDuplicateAmount (callBack) {
        // Split the input into lines
        const lines = inputLines;
      
        // Create a map to store addresses and their corresponding total amounts
        const addressTotalMap = new Map();
      
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
      
          // Split the line into address and amount based on space, single quotation mark, or equals sign
          const parts = line.split(/[\s,=]/);
      
          // Check if the address starts with "0x" and is 42 characters long
          if (parts[0].startsWith("0x") && parts[0].length === 42) {
            // Check if the amount is a valid number (not NaN)
            const amount = parseFloat(!isNaN(parts[1])?parts[1]:null);
            if (amount) {
              // If the address is already in the map, add the amount to the existing total
              if (addressTotalMap.has(parts[0])) {
                addressTotalMap.set(parts[0], addressTotalMap.get(parts[0]) + amount);
              } else {
                // If the address is not in the map, add it with the initial amount
                addressTotalMap.set(parts[0], amount);
              }
            }
          }
        }
      
        // Create an array to store the combined lines
        // const combinedLines = addressTotalMap.map(item => `${item.key}=${item.value}`);
        const combinedLines = Array.from(addressTotalMap, ([key, value]) => `${key}=${value}`);

       
      
        // Update the input box text with the combined lines
        const updatedText = combinedLines.join("\n");
        document.getElementById("inputBox").value = updatedText;
        updateLineNumbers();
    callBack();
      }

  function onSubmit() {
    const inputBox = document.getElementById("inputBox");
    let errorMessages = document.getElementById("errorMessages");
    errorMessages.innerHTML = ""; // Clear previous error messages
    setAddressMap(new Map());
    setAddressLineMap(new Map());

    // Create a new unordered list
    const errorList = document.createElement("ul");

    // Split the input into lines
    const lines = inputBox.value.split("\n");
  
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Initialize error flags
      let invalidAddress = false;
      let invalidAmount = false;

      // Check if the address starts with "0x" and is 42 characters long
      const parts = line.split(/[\s,=]/);
      if (!parts[0].startsWith("0x") || parts[0].length !== 42) {
        invalidAddress = true;
      }

      // Split the line into address and amount based on space, single quotation mark, or equals sign

      // Check if the amount is not a valid number (NaN)
      if (isNaN(parts[1])) {
        invalidAmount = true;
      } else {
        // If address is already in the map, add the amount and track the line number
        if (addressMap.has(parts[0])) {
          addressMap.set(
            parts[0],
            addressMap.get(parts[0]) + parseFloat(parts[1])
          );
          addressLineMap.get(parts[0]).push(i + 1); 
          // Store line numbers
        } else {
          addressMap.set(parts[0], parseFloat(parts[1]));
          addressLineMap.set(parts[0], [i + 1]); // Initialize line number array
        }
      }

      // Construct the error message based on error flags
      if (invalidAddress && invalidAmount) {
        // Both errors present
        const errorItem = document.createElement("li");
        errorItem.textContent = `Line ${
          i + 1
        } Invalid Ethereum address and wrong amount`;
        errorList.appendChild(errorItem);
      } else if (invalidAddress) {
        // Invalid address only
        const errorItem = document.createElement("li");
        errorItem.textContent = `Line ${i + 1} Invalid Ethereum address`;
        errorList.appendChild(errorItem);
      } else if (invalidAmount) {
        // Invalid amount only
        const errorItem = document.createElement("li");
        errorItem.textContent = `Line ${i + 1} wrong amount`;
        errorList.appendChild(errorItem);
      }
    }

    // If there are errors, append the error list to the error messages container
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
    }
    setduplicate(duplicateAddresses.length > 0? true : false);

  }
  function updateLineNumbers() {
    const inputBox = document.getElementById("inputBox");
    const lineNumbers = document.getElementById("lineNumbers");
    const lines = inputBox.value.split("\n");
    setInputLines([...lines]);
    lineNumbers.innerHTML = "";
    for (let i = 0; i < lines.length; i++) {
      lineNumbers.innerHTML += i + 1 + "<br>";
    }
  }
  useEffect(() => {
    // onSubmit();
    },[inputLines])
  

  // Attach the onSubmit function to the "Next" button click event
  // const nextButton = document.getElementById('nextButton');
  // nextButton.addEventListener('click', onSubmit);
  return (
    <div className="container">
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
        <button id="nextButton" onClick={() => onSubmit()}>
          Next
        </button>
        {duplicate && (
          <div className="title duplicate">
            <p>Duplicated</p>
            <div className="btn">
              <button onClick={()=>removeDuplicate(function () {onSubmit()})}>Keep the first one</button>
              <span>|</span>
              <button onClick={()=>combineDuplicateAmount(function () {onSubmit()})}>Combine balance</button>
            </div>
          </div>
        )}
        <div id="errorMessages"></div>
      </div>
    </div>
  );
};

export default DisperseValidator;
