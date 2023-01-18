import util from "util";
import { Keccak } from "sha3";
import { sha3 } from "web3-utils";
import AbiCoder from "web3-eth-abi";
import { BN } from "bn.js";
interface IState {
  savedABIs: Array<any>;
  methodIDs: any;
}

const state: IState = {
  // TODO: MOVE THIS INTO DATABASE
  savedABIs: [],
  methodIDs: {},
};

interface IDecodedParams {
  name: any;
  type: any;
  value: any;
}
interface IRetrivedData {
  name: string;
  params: Array<any>;
}
function typeParser(input: any) {
  if (input["type"] === "tuple") {
    return `(${input["components"].map(typeParser).join(",")})`;
  }
  return input["type"];
}

export default class BetterDecoder {
  decodeMethod(data: string) {
    const methodID = data.slice(2, 10);
    const correspondingAbi = state.methodIDs[methodID];
    console.log(methodID, correspondingAbi, "herebicht");
    if (correspondingAbi) {
      let decoded = AbiCoder.decodeParameters(
        correspondingAbi.inputs,
        data.slice(10)
      );
      let retrievedData: IRetrivedData = {
        name: correspondingAbi.name,
        params: [],
      };

      for (let i = 0; i < decoded.__length__; i++) {
        let param = decoded[i];
        let parsedParam = param;
        const isUint = correspondingAbi.inputs[i].type.indexOf("uint") === 0;
        const isInt = correspondingAbi.inputs[i].type.indexOf("int") === 0;
        const isAddress =
          correspondingAbi.inputs[i].type.indexOf("address") === 0;
        if (isUint || isInt) {
          const isArray = Array.isArray(param);
          if (isArray) {
            parsedParam = param.map((val: string) => new BN(val).toString());
          } else {
            parsedParam = new BN(param).toString();
          }
        }

        // normalisation
        if (isAddress) {
          const isArray = Array.isArray(param);

          if (isArray) {
            parsedParam = param.map((p: string) => p.toLowerCase());
          } else {
            parsedParam = param.toLowerCase();
          }
        }

        retrievedData.params.push({
          name: correspondingAbi.inputs[i].name,
          value: parsedParam,
          type: correspondingAbi.inputs[i].type,
        });
        return retrievedData;
      }
    } else {
      console.log("fr, is not in our database");
    }
  }

  addABI(abiArray: Array<unknown>) {
    abiArray.map(function (abi: any) {
      if (abi["name"]) {
        // const hash = new Keccak(256);
        const signatureString = `${abi["name"]}(${abi["inputs"]
          .map(typeParser)
          .join(",")})`;
        // const signature = hash.update(signatureString);
        // const signatureDigest = signature.digest("hex");
        const signature = sha3(signatureString);
        if (signature) {
          if (abi["type"] === "event") {
            state.methodIDs[signature.slice(2)] = abi;
          } else {
            state.methodIDs[signature.slice(2, 10)] = abi;
          }
          state.savedABIs = state.savedABIs.concat(abiArray);
        } else {
          console.log("lol signature error");
        }
      }
    });
  }
  // big copy bast blob that just works
  decodeLogs(logs: Array<any>) {
    console.log("Decoding logs");
    return logs
      .filter((log) => log.topics.length > 0)
      .map((logItem) => {
        const methodID = logItem.topics[0].slice(2);
        const method = state.methodIDs[methodID];
        if (method) {
          const logData = logItem.data;
          let decodedParams: IDecodedParams[] = [];
          let dataIndex = 0;
          let topicsIndex = 1;

          let dataTypes: any[] = [];
          method.inputs.map(function (input: {
            indexed: boolean;
            type: string;
            internalType: string;
            name: string;
          }) {
            if (!input.indexed) {
              dataTypes.push(input.type);
            }
          });

          const decodedData = AbiCoder.decodeParameters(
            dataTypes,
            logData.slice(2)
          );

          // Loop topic and data to get the params
          method.inputs.map(function (param: {
            name: any;
            type: string;
            indexed: any;
            value: any;
          }) {
            let _decodedParams = {
              name: param.name,
              type: param.type,
              value: "",
            };

            if (param.indexed) {
              _decodedParams.value = logItem.topics[topicsIndex];
              topicsIndex++;
            } else {
              _decodedParams.value = decodedData[dataIndex];
              dataIndex++;
            }

            if (param.type === "address") {
              _decodedParams.value = _decodedParams.value.toLowerCase();
              // 42 because len(0x) + 40
              if (_decodedParams.value.length > 42) {
                let toRemove = _decodedParams.value.length - 42;
                let temp = _decodedParams.value.split("");
                temp.splice(2, toRemove);
                _decodedParams.value = temp.join("");
              }
            }

            if (
              param.type === "uint256" ||
              param.type === "uint8" ||
              param.type === "int"
            ) {
              // ensure to remove leading 0x for hex numbers
              if (
                typeof _decodedParams.value === "string" &&
                _decodedParams.value.startsWith("0x")
              ) {
                _decodedParams.value = new BN(
                  _decodedParams.value.slice(2),
                  16
                ).toString(10);
              } else {
                _decodedParams.value = new BN(_decodedParams.value).toString(
                  10
                );
              }
            }

            decodedParams.push(_decodedParams);
          });

          return {
            name: method.name,
            events: decodedParams,
            address: logItem.address,
          };
        }
      });
  }
}
