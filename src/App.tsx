import React, { useRef, useState } from "react";
import useModal from "./components/useModal";
import IForm from "./components/IForm";
import { Button, Input, message } from "antd";
import moment from "moment";
import * as XLSX from "xlsx";
import "./App.css";

// 追加自定义键名
const formatObj = (obj: any) => {
  return obj;
};

const a = function () { }

const b = function () { }

const c = function () { }

const d = function () {
  let a = null
  let a = null
}


const e = function () { }


// 处理特定键名的键值
const translateValueMap: Map<any, any> = new Map([
  [
    /日期|time|Time|时间|止期|起期/,
    (value: any, item: any) => correctingTime(value),
  ],
]);

// 格式化数组
function formatArray(arr: any[]) {
  if (!Array.isArray(arr)) {
    return [];
  }
  const newArr = arr
    .map((item: any) => {
      const obj: any = {};
      for (let i in item) {
        let translateFn: any = null;
        translateValueMap.forEach((valueFn, key) => {
          if (Object.prototype.toString.call(key) === "[object RegExp]") {
            if (key.test(i)) {
              translateFn = valueFn;
            }
          } else if (key === i) {
            translateFn = valueFn;
          }
        });
        const itemValue = translateFn ? translateFn(item[i], item) : item[i];
        obj[i] = itemValue;
      }
      return formatObj(obj);
    })
    .filter((item: any) => "{}" !== JSON.stringify(item));
  return newArr;
}

// 时间格式化
function correctingTime(value: any) {
  // 43为xlsx时区误差
  return moment(value).add(43, "seconds").format("YYYY-MM-DD HH:mm:ss");
}

// 读取XLSX
async function filePicked(file: File) {
  const oFile = file;
  const sFilename = oFile.name;
  const reader = new FileReader();
  // Tell JS To Start Reading The File.. You could delay this if desired
  reader.readAsBinaryString(oFile);
  return new Promise((resolve, reject) => {
    // Ready The Event For When A File Gets Selected
    reader.onload = function (e: any) {
      const data = e.target.result;
      const cfb = XLSX.read(data, { type: "binary", cellDates: true });
      const cfbArray = cfb.SheetNames.map((sheetName) => {
        const oJS = XLSX.utils.sheet_to_json(cfb.Sheets[sheetName]);
        return {
          title: sheetName,
          content: oJS,
        };
      });
      resolve({
        cfbArray,
        sFilename,
      });
    };
  });
}

function getAllObjectKey(arr: any[]): string[] {
  const keyArr = arr.reduce((acc, cur) => {
    if (Object.prototype.toString.call(cur) === "[object Object]") {
      return [...acc, ...Object.keys(cur)];
    }
    return acc;
  }, []);
  return Array.from(new Set(keyArr));
}

function replaceAllObjectKey(
  arr: any[],
  replaceObj: { [x: string]: string | number }
) {
  const remainderSet = new Set(Object.keys(replaceObj));
  const newArr = arr.map((item: any) => {
    const obj: any = {};
    for (let i in item) {
      if (remainderSet.has(i)) {
        if (replaceObj[i]) {
          obj[replaceObj[i]] = item[i];
        } else {
          obj[i] = item[i];
        }
      }
    }
    return obj;
  });
  return newArr;
}

function App() {
  const [dataSource, setDataSource] = useState<any[]>([]);
  const [showModal, hideModal, getContentRef, renderModal]: any = useModal();
  const formRef: any = useRef(null);
  const inputRef: any = useRef("");

  const renderFileUpload = () => {
    return (
      <div
        className="fileContainer"
        onClick={() => {
          const fileDom = document.getElementById("fileUpload");
          fileDom?.click();
        }}
      >
        <input
          id="fileUpload"
          className="fileUpload"
          type="file"
          accept=".xls,.xlsx"
          onChange={async (e) => {
            const { files } = e.target;
            if (files && files.length) {
              const { cfbArray, sFilename }: any = await filePicked(files[0]);
              document.title = sFilename;
              setDataSource(cfbArray);
            }
          }}
        />
      </div>
    );
  };

  const renderResultBox = () => {
    return (
      <div className="resultBox">
        {dataSource.map((item, index) => {
          return (
            <div
              className="resultBoxItem"
              key={index}
              onClick={() => {
                // 结果Modal
                const showResultModal = (title: string, content: any[]) => {
                  showModal({
                    title: title,
                    content: JSON.stringify(content),
                    footer: (
                      <>
                        <Button
                          ghost
                          style={{
                            background: "#389e0d",
                            borderColor: "#389e0d ",
                          }}
                          onClick={() => {
                            hideModal();
                            setTimeout(() => {
                              const content = getContentRef();
                              showAddModal(title, content);
                            }, 0);
                          }}
                        >
                          追加键值
                        </Button>
                        <Button
                          ghost
                          style={{
                            background: "#2b5f8e",
                            borderColor: "#2b5f8e",
                          }}
                          onClick={() => {
                            hideModal();
                            setTimeout(() => {
                              const content = getContentRef();
                              showEditorModal(title, content);
                            }, 0);
                          }}
                        >
                          编辑键值
                        </Button>
                      </>
                    ),
                  });
                };
                // 编辑Modal
                const showEditorModal = (
                  title: string,
                  modifyContentStr: string
                ) => {
                  const modifyContent = JSON.parse(modifyContentStr);
                  const keyArr = getAllObjectKey(modifyContent);
                  showModal({
                    title: `${title}——编辑键值`,
                    content: (
                      <IForm
                        getFormRef={(form: any) => {
                          formRef.current = form;
                        }}
                        formOptions={keyArr.map((label: string) => {
                          return {
                            label,
                            name: label,
                            node: <Input placeholder="请输入" />,
                          };
                        })}
                      />
                    ),
                    footer: (
                      <>
                        <Button
                          danger
                          onClick={() => {
                            hideModal();
                            setTimeout(() => {
                              showResultModal(title, modifyContent);
                            }, 0);
                          }}
                        >
                          返回
                        </Button>
                        <Button
                          ghost
                          style={{
                            background: "#2b5f8e",
                            borderColor: "#2b5f8e",
                          }}
                          onClick={() => {
                            hideModal();
                            setTimeout(() => {
                              const formData = formRef.current.getFieldsValue();
                              const modifyContentNext = replaceAllObjectKey(
                                modifyContent,
                                formData
                              );
                              showResultModal(title, modifyContentNext);
                            }, 0);
                          }}
                        >
                          确定
                        </Button>
                      </>
                    ),
                  });
                };

                // 追加Modal
                const showAddModal = (
                  title: string,
                  modifyContentStr: string
                ) => {
                  const modifyContent = JSON.parse(modifyContentStr);
                  showModal({
                    title: `${title}——追加键值`,
                    content: (
                      <Input.TextArea
                        autoSize={{ minRows: 10, maxRows: 20 }}
                        placeholder="（示例，空格换行）订单号：123456789"
                        onChange={(e: any) => {
                          inputRef.current = e.target.value;
                        }}
                      />
                    ),
                    footer: (
                      <>
                        <Button
                          danger
                          onClick={() => {
                            hideModal();
                            setTimeout(() => {
                              showResultModal(title, modifyContent);
                            }, 0);
                          }}
                        >
                          返回
                        </Button>
                        <Button
                          ghost
                          style={{
                            background: "#2b5f8e",
                            borderColor: "#2b5f8e",
                          }}
                          onClick={() => {
                            const inputStr = inputRef.current;
                            if (inputStr.length) {
                              const rowArr = inputStr.split("\n");
                              const addItemObj = rowArr.reduce(
                                (acc: any, cur: any) => {
                                  const formatItem = String(cur).replace(
                                    "：",
                                    ":"
                                  );
                                  const hasValue = formatItem.includes(":");
                                  if (hasValue) {
                                    const [key, value] = formatItem.split(":");
                                    return {
                                      ...acc,
                                      [key]: value,
                                    };
                                  } else {
                                    return acc;
                                  }
                                },
                                {}
                              );
                              hideModal();
                              setTimeout(() => {
                                const modifyContentNext = modifyContent.map(
                                  (item: any) => {
                                    return {
                                      ...item,
                                      ...addItemObj,
                                    };
                                  }
                                );
                                showResultModal(title, modifyContentNext);
                              }, 0);
                            } else {
                              hideModal();
                              setTimeout(() => {
                                showResultModal(title, modifyContent);
                              }, 0);
                            }
                          }}
                        >
                          确定
                        </Button>
                      </>
                    ),
                  });
                };

                const initialContent = formatArray(item.content);
                showResultModal(item.title, initialContent);
              }}
            >
              {item.title}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="App">
      <div className="App-header">
        {renderFileUpload()}
        {renderResultBox()}
      </div>
      {renderModal()}
    </div>
  );
}

export default App;
