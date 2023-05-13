import React, { useRef, useState } from "react";
import { Button, message, Modal } from "antd";

function useModal() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const optionsRef = useRef({});
  const contentRef = useRef("");
  const onOkRef: any = useRef(null);

  const showModal = (params: any) => {
    const { content, onOk, ...options } = params;
    contentRef.current = content;
    onOkRef.current = onOk;
    optionsRef.current = options;
    setIsModalVisible(true);
  };

  const hideModal = () => {
    setIsModalVisible(false);
  };

  const getContentRef = () => {
    return contentRef.current;
  };

  const renderModal = () => {
    return (
      <Modal
        visible={isModalVisible}
        width={1000}
        bodyStyle={{
          height: "500px",
          overflow: "auto",
        }}
        onCancel={hideModal}
        {...optionsRef.current}
      >
        <div
          style={{
            letterSpacing: ".2em",
            fontSize: "18px",
            color: "#613400",
          }}
        >
          {contentRef.current}
        </div>
      </Modal>
    );
  };

  return [showModal, hideModal, getContentRef, renderModal];
}

export default useModal;
