import React, { useState, useEffect, Fragment } from 'react';
import styled from 'styled-components';
import { Select, Tabs, Button, Input, Modal, Icon, Checkbox, message } from 'antd';
import { ContainerBody } from "src/components/LittleComponents";
import api from "src/tools/api";
import SDTable from "src/components/SDTable";

import tableColumns from './tableColumns';

const TabPane = Tabs.TabPane;
const { Option } = Select;

// styled-components样式包装组件

const StyledTabs = styled(Tabs)`
    /* 覆写antd样式 */
    .ant-tabs-bar.ant-tabs-top-bar {
        background: #ffffff;
        border-radius: 4px;
        border-bottom: 2px solid #D3E4FF;
        margin: 3px 1px 0;
        box-shadow: 0 0 4px 1px rgba(80, 84, 90, 0.1);

        .ant-tabs-tab {
            padding: 9px 15px 13px;
            margin-left: 20px;
            font-size: 15px;
            font-family: SourceHanSansCN-Regular, "Microsoft YaHei", sans-serif;
            font-weight: 400;
            color: rgba(65, 97, 136, 1);
        }
    }
`;

// tab外框
const StyledPane = styled.div`
    box-shadow: 0 0 4px 1px rgba(80, 84, 90, 0.1);
    background: #ffffff;
    margin-bottom: 10px;
    padding: 16px;
`;

// 查询条件表单
const StyledForm = styled.div`
    height: 40px;
    line-height: 40px;
    margin-bottom: 10px;
`;

// 表单内容
const StyledFormItem = styled.div`
    display: inline-block;
    margin-right: 15px;

    & > span {
        padding-left: 10px;
    }
`;

// 下拉菜单
const StyledSelect = styled(Select)`
    display: inline-block;
    width: 160px;
    vertical-align: middle;
`;

// 集群下啦菜单
const StyledClusterSelect = styled(StyledSelect)`
    margin-right: 15px;
`;

// 按钮
const StyledButton = styled(Button)`
    height: 32px;
    border-radius: 2px;
    text-shadow: none;
    box-shadow: 0 2px 4px 0 rgba(16, 112, 225, 0.16);
    margin-right: 10px;
`;

// 查询按钮
const StyledPrimaryButton = styled(StyledButton)`
    height: 32px;
    border: none;
    background: #1B67E0;
    color: #ffffff;

    &:hover {
        background: #1B67E0;
        color: #ffffff;
    }
`;

// 数字输入框
const StyledNumberInput = styled(Input)`
    width: 80px;
    height: 32px;
    vertical-align: middle;
    margin-left: 10px;
`;

// 导出列选择输入框
const ExportModal = styled(Modal)`
    top: ${props => `${props.top}px`};
    left: ${props => `${props.left}px`};
    margin: 0;
`;

// 导出按钮
const ExportBtn = styled.a`
    font-size: 15px;
    float: right;
`;

// 导出列名选择checkbox
const FlexCheckboxGroup = styled(Checkbox.Group)`
    display: flex;
    flex-wrap: wrap;

    label {
        flex: 50%;
        margin: 0;
    }
`;

// 小文件梳理组件
export default function FileArrangement(props) {
    // 集群选择值
    const [clusterValue, setClusterValue] = useState('');
    // 集群获取失败状态
    // const [clusterRequestError, setClusterRequestError] = useState(false);

    //集群选项
    const [clusterOptions, setClusterOptions] = useState([]);
    useEffect(() => {
        getClusterOptions();
    }, []);// 近首次加载时触发

    // 上方tab列表
    const topPanes = [
        {
            key: 'tab1',
            title: 'HDFS文件处理',
            content: <HDFS />,
        }
    ];

    // 下方tab列表
    const bottomPanes = [
        {
            key: 'tab1',
            title: '小文件处理',
            content: <TinyFile />,
        }
    ];

    // 获取集群列表
    const getClusterOptions = async () => {
        try {
            const res = await api.getClusterBasicInfo();

            if (res.data.success !== 'true') {
                message.destroy();
                message.error(res.data.msg);
                // setClusterRequestError(true);
                return;
            }

            setClusterOptions(res.data.data);
            setClusterValue(res.data.data[0].clusterName);
            // setClusterRequestError(false);
        } catch (err) {
            message.destroy();
            message.error('获取集群列表失败');
        }
    };

    // 集群选项修改事件
    const onClusterChange = (value) => {
        setClusterValue(value);
    };

    return (
        <ContainerBody>
            <StyledTabs
                defaultActiveKey="tab1"
                // className="sd-tabs bordered-title-tabs"
                tabBarExtraContent={
                    <StyledClusterSelect
                        notFoundContent="暂无数据"
                        value={clusterValue}
                        onChange={onClusterChange}
                    >
                        {
                            clusterOptions.map(item =>
                                <Option key={item.clusterName} value={item.clusterName}>
                                    {item.clusterName}
                                </Option>
                            )
                        }
                    </StyledClusterSelect>
                }
            >
                {
                    topPanes.map(pane =>
                        <TabPane key={pane.key} tab={pane.title}>{pane.content}</TabPane>
                    )
                }
            </StyledTabs>
            <StyledTabs
                defaultActiveKey="tab1"
                // className="sd-tabs bordered-title-tabs"
            >
                {
                    bottomPanes.map(pane =>
                        <TabPane key={pane.key} tab={pane.title}>{pane.content}</TabPane>
                    )
                }
            </StyledTabs>
        </ContainerBody>
    );
}





// HDFS文件处理组件
function HDFS(props) {
    // 表格式选择值
    const [tableType, setTableType] = useState('regionColumns');
    // 列表查询中状态
    const [fetching, setFetching] = useState(false);
    // 导出模态框显隐
    const [exportModalVisible, setExportModalVisible] = useState(false);
    // 导出模态狂位置
    const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });
    // 导出模态狂checkbox选中值
    const [checkedColumns, setCheckedColumns] = useState(
        tableColumns[tableType].reduce((acc, cur) => {
            return cur.checkboxDisabled ? [...acc, cur.title] : acc
        }, [])
    );

    // 表格式选项列表
    const tableTypeOptions = [
        {
            name: '地市分区表',
            columns: 'regionColumns'
        }, {
            name: '天（小时）分区表',
            columns: 'dailyColumns'
        }, {
            name: '周分区表',
            columns: 'weeklyColumns'
        }, {
            name: '月分区表',
            columns: 'monthlyColumns'
        }, {
            name: '其他分区表',
            columns: 'otherColumns'
        },
    ];

    // 表格式修改事件
    const onTableTypeChange = (value) => {
        setTableType(value);
        setCheckedColumns(tableColumns[value].reduce((acc, cur) => {
            return cur.checkboxDisabled ? [...acc, cur.title] : acc
        }, []));
    };

    // 导出模态框显隐控制
    const toggleExportModal = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();

        !exportModalVisible && setModalPosition({
            x: rect.x,
            y: rect.y + rect.height + 10
        });
        setExportModalVisible(!exportModalVisible);
    };

    // 到处模态框checkbox修改事件
    const onCheckedColumnsChange = (checkedValues) => {
        setCheckedColumns(checkedValues);
    };

    // 导出HDFS列表内容
    const exportHDFS = () => {

    };

    return (
        <StyledPane>
            <StyledForm>
                <StyledFormItem>
                    <span>请选择表格式：</span>
                    <StyledSelect
                        notFoundContent="暂无数据"
                        value={tableType}
                        onChange={onTableTypeChange}
                    >
                        {
                            tableTypeOptions.map(item =>
                                <Option key={item.name} value={item.columns}>
                                    {item.name}
                                </Option>
                            )
                        }
                    </StyledSelect>
                </StyledFormItem>
                <StyledFormItem>
                    <StyledPrimaryButton>立即更新</StyledPrimaryButton>
                    <StyledButton onClick={toggleExportModal}>导出</StyledButton>
                </StyledFormItem>
            </StyledForm>
            <SDTable
                rowKey="index"
                columns={tableColumns[tableType]}
                className="sd-table-simple"
                scroll={{ x: '200%' }}
                bordered={true}
            />

            <ExportModal
                title={
                    <Fragment>
                        选择导出字段
                        <ExportBtn
                            onClick={exportHDFS}
                        >
                            <Icon type="arrow-right" />确认导出
                        </ExportBtn>
                    </Fragment>
                }
                top={modalPosition.y}
                left={modalPosition.x}
                width={400}
                closable={false}
                maskClosable={true}
                maskStyle={{
                    background: 'none'
                }}
                visible={exportModalVisible}
                onCancel={toggleExportModal}
                footer={null}
            >
                <FlexCheckboxGroup
                    options={tableColumns[tableType].map(item => {
                        return {
                            label: item.title,
                            value: item.title,
                            disabled: item.checkboxDisabled
                        };
                    })}
                    value={checkedColumns}
                    onChange={onCheckedColumnsChange}
                />
            </ExportModal>
        </StyledPane>
    );
}





// 小文件处理组件
function TinyFile(props) {
    // 列表查询中状态
    const [fetching, setFetching] = useState(false);
    // 文件大小输入值
    const [fileSize, setFileSize] = useState(0);
    // 表文件数量输入值
    const [fileAmount, setFileAmount] = useState(0);

    return (
        <StyledPane>
            <StyledForm>
                <StyledFormItem>
                    <span>{`文件大小 <`}</span>
                    <StyledNumberInput
                        type='number'
                        value={fileSize}
                        onChange={e => setFileSize(e.target.value)}
                    />
                </StyledFormItem>
                <StyledFormItem>
                    <span>{`表文件数量 >`}</span>
                    <StyledNumberInput
                        type='number'
                        value={fileAmount}
                        onChange={e => setFileAmount(e.target.value)}
                    />
                </StyledFormItem>
                <StyledFormItem>
                    <StyledPrimaryButton>查询</StyledPrimaryButton>
                    <StyledButton>导出</StyledButton>
                </StyledFormItem>
            </StyledForm>
            <SDTable
                rowKey="index"
                columns={tableColumns.tinyFileColumns}
                className="sd-table-simple"
                scroll={{ x: '130%' }}
                bordered={true}
            />
        </StyledPane>
    );
}