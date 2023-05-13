import React, { useEffect, useRef, useState } from "react";
import { Col, Form, Row } from "antd";
import { CloseCircleOutlined } from "@ant-design/icons";

type Props = {
  getFormRef: Function;
  formOptions: any[];
};

function IForm({ getFormRef, formOptions }: Props) {
  const [form] = Form.useForm();
  const [options, setOptions] = useState(formOptions);

  useEffect(() => {
    getFormRef(form);
  }, []);

  return (
    <Form form={form}>
      {options.map(({ name, node, ...rest }: any, index: number) => {
        return (
          <Row gutter={24} key={index}>
            <Col span={22}>
              <Form.Item name={name} {...rest}>
                {node
                  ? React.cloneElement(node, {
                      ...node.props,
                    })
                  : node}
              </Form.Item>
            </Col>
            <Col span={2}>
              <CloseCircleOutlined
                style={{
                  color: "#f50",
                  fontSize: "24px",
                  padding: "4px 0",
                  cursor: "pointer",
                }}
                onClick={() => {
                  setOptions(
                    options.filter((item) => {
                      return name !== item.name;
                    })
                  );
                }}
              />
            </Col>
          </Row>
        );
      })}
    </Form>
  );
}

export default IForm;
