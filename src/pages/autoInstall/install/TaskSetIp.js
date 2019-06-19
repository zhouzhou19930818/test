/** 装机管理-设置IP
 *  @author luodt on 2019.06.14
 */
import React, { Component, Fragment } from 'react';
import { Input } from 'antd';
import styled from 'styled-components';
import update from 'immutability-helper';

import { debounce } from 'src/tools/utils';
import api from "src/tools/api";

import SDTable from "src/components/SDTable";
import SDModal from "src/components/SDModal";
import IpInput from "src/components/IpInput";

import NETCARDIMG from 'src/assets/images/port.png';

// 主机绑定状态
const STATUS = {
    0: {
        text: '未绑定',
        bgColor: '#CDD1DA',
        color: '#fff',
    },
    1: {
        text: '绑定成功',
        bgColor: '#EAF8E5',
        color: '#008364',
    },
    2: {
        text: '绑定失败',
        bgColor: '#FFF6C9',
        color: '#614836',
    },
    3: {
        text: '绑定中',
        bgColor: '#D2F1FF',
        color: '#213555',
    }
};
const StatusBtn = styled.span`
        background: ${(props) => props.bgColor || '#CDD1DA'};
        color: ${(props) => props.color || '#fff'};
        padding: 4px 16px;
        border-radius: 2px;
        white-space: nowrap;
    `;

// 主机操作按钮
const OperationBtn = styled.span`
        display: inline-block;
        color: ${(props) => props.disabled ? '#CDD1DA' : '#0B72D9'};
        margin-right: 16px;
        cursor: ${(props) => props.disabled ? 'not-allowed' : 'pointer'};

        &:last-of-type {
            margin: 0;
        }
    `;

// 表格2次样式
const IPTable = styled(SDTable)`
        .ant-table {
            border-bottom: 1px solid #E8EAED;
        }
        .ant-table-thead > tr:first-child > th.ant-table-expand-icon-th,
        .ant-table-tbody > tr > td:first-child {
            width: 0px !important;
            padding: 0px !important;
            min-width: 0px !important;
            max-width: 0px !important;
            border: 0;
        }
      `;

// IP输入项组件
const IPSetItemContainer = styled.div`
        margin-bottom: 8px;

        &:last-of-type {
            margin-bottom: 0;
        }

        &>div {
            display: inline-block;
            vertical-align: top;
        }

        &>span:first-of-type {
            color: #585E69;
            margin-right: 32px;
        }

        .net-card-item {
            &::before {
                content: url(${NETCARDIMG});
                margin: 0 6px 0 18px;
                vertical-align: sub;
            }

            color: #686F7A;
            vertical-align: middle;     
        }
    `;

// 新增按钮
const AddBtn = styled.span`
        display: inline-block;
        width: 20px;
        height: 20px;
        line-height: 18px;
        text-align: center;
        background: #D3E5F6;
        color: #0B72D9;
        margin-left: 8px;
        cursor: pointer;
    `;

// 删除按钮
const DelBtn = styled(AddBtn)`
        background: #F43943;
        color: #FFFFFF;
    `;

// 执行按钮
const ExecutionBtn = styled.span`
        background:#0B72D9;
        color: #fff;
        padding: 6px 22px;
        cursor: pointer;
        float: right;
        margin-top: 12px;
    `;

class TaskSetIp extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // 表格数据加载
            tableLoading: false,

            // 表格数据
            tableData: [],

            // 详情弹框显示状态
            isDeatilModalShow: false,
        };

        // 为了展开所有行生效而定义的储存所有行key的数组
        this.expandedRowKeys = [];

        // 表头
        this.columns = [
            {
                title: '主机',
                dataIndex: 'host',
                width: 140,
            }, {
                title: '机房',
                dataIndex: 'engineRoom',
                width: 140,
            }, {
                title: '设置IP',
                dataIndex: 'ip',
                width: 100,
                render: (text) => <span>{text.length}</span>,
            }, {
                title: '掩码',
                dataIndex: 'mask',
                width: 184,
                render: (text, row, index) => <IpInput index={`mask_${index}`} onChangeIp={(ip) => console.log(ip)} />,
            }, {
                title: '网关',
                dataIndex: 'gateWay',
                width: 184,
                render: (text, row, index) => <IpInput index={`gateWay_${index}`} onChangeIp={(ip) => console.log(ip)} />,
            }, {
                title: 'DNS',
                dataIndex: 'dns',
                width: 184,
                render: (text, row, index) => <IpInput index={`dms_${index}`} onChangeIp={(ip) => console.log(ip)} />,
            }, {
                title: '状态',
                dataIndex: 'status',
                width: 124,
                render: (data) => {
                    const { text = '未绑定', ...otherConfig } = STATUS[data];
                    return <StatusBtn {...otherConfig}>{text}</StatusBtn>
                },
            }, {
                title: '操作',
                dataIndex: 'operation',
                width: 160,
                render: (text, row) => <Fragment>
                    <OperationBtn
                        disabled={[0, 3].includes(row.status)}
                        onClick={() => this.toggleDetailModal(row)}
                    >
                        详情
                    </OperationBtn>
                    <OperationBtn
                        disabled={[0, 1, 3].includes(row.status)}
                        onClick={() => this.handleRetry(row)}
                    >
                        重试
                    </OperationBtn>
                    <OperationBtn
                        disabled={[0, 1, 3].includes(row.status)}
                        onClick={() => this.handleDeleteRow(row)}
                    >
                        剔除
                    </OperationBtn>
                </Fragment>
            },
        ];

    }

    componentDidMount() {
        this.getTableData();
    }

    // 获取表格数据
    getTableData = () => {
        this.setState({
            tableLoading: true
        }, () => {
            // api.getTableData().then(res => {
            const json = [
                {
                    host: '主机001',
                    engineRoom: '萝岗机房',
                    status: 0,
                    netCardList: ['1', '2', '3', '4'],
                },
                {
                    host: '主机002',
                    engineRoom: '萝岗机房',
                    status: 1,
                    netCardList: ['5', '6', '7'],
                },
                {
                    host: '主机003',
                    engineRoom: '萝岗机房',
                    status: 2,
                    netCardList: ['8', '9', '10', '11', '12'],
                },
                {
                    host: '主机004',
                    engineRoom: '萝岗机房',
                    status: 3,
                    netCardList: ['13', '14'],
                }
            ];
            const data = json.map(item => {
                this.expandedRowKeys.push(item.host);
                const ipArr = [];
                for (let i = 0; i < item.netCardList.length; i += 2) {
                    ipArr.push({
                        ipUrl: '',
                        index: i / 2,
                        netCard: item.netCardList[i + 1] ? [item.netCardList[i], item.netCardList[i + 1]] : [item.netCardList[i]]
                    })
                }
                return {
                    ...item,
                    ip: ipArr
                }
            });
            this.setState({
                tableLoading: false,
                tableData: data
            })
            // })
        })
    }

    /** 渲染IP、网卡分配输入框
     * @param {object} row:表格行的数据集合
     */
    renderIpSettingArea = (row, index) => {
        return row.ip.map((item, key) => <IpSetItem
            canDel={row.ip.length > 1}
            parentId={index}
            key={item.index}
            index={key}
            item={item}
            handleDealIpItem={this.handleDealIpItem}
            handleChange={this.handleChangeIP}
        />)
    }

    /** ip设置项的新增与删除
     * @param {string} type: 新增(add)/删除(del)
     * @param {number} parentId: 表格行的索引值
     * @param {number} key: ip的key值
     */
    handleDealIpItem = (type, parentId, key) => {
        let opts = {};
        if (type === 'add') {
            opts = {
                $push: [{
                    ipUrl: '',
                    index: this.state.tableData[parentId].ip.length,
                    netCard: [],
                }]
            };
        } else {
            opts = {
                $splice: [[key, 1]]
            }
        }
        this.setState(update(this.state, {
            tableData: {
                [parentId]: {
                    ip: opts
                }
            }
        }));
    }

    /** ip输入项值得储存
     * @param {string} type: 改变项
     * @param {string} val: 改变后的值
     * @param {number} parentId : 表格行的索引
     * @param {number} key: 索引 
     */
    handleChangeIP = (type, val, parentId, key) => {
        this.setState(update(this.state, {
            tableData: {
                [parentId]: {
                    ip: {
                        [key]: {
                            [type]: { $set: val }
                        }
                    }
                }
            }
        }))
    }

    /** 根据主机名称、机房名称模糊查询数据
     * @param {string} val: 输入的值
     */
    handleSearch = (val) => {
        this.setState({ tableLoading: true });
        const fn = (value) => () => {
            // api.getModelByNameOrDesc(value).then((res) => {
            this.setState({
                // dataSource: res.data.data && res.data.data.map((d, i) => ({ ...d, index: i + 1 })),
                tableLoading: false,
            })
            // })
        };
        debounce(fn(val));
    }

    /** 详情弹框的显示方法
     * @param {object} data: 表格行的数据
     */
    toggleDetailModal = (data) => {
        if ([0, 3].includes(data.status)) return;
        const visible = !this.state.isDeatilModalShow;
        // if(visible) {

        // }
        this.setState({
            isDeatilModalShow: visible
        })
    }

    /** 重试绑定
     *  @param {object} data 表格行的数据
     */
    handleRetry = (data) => {

    }

    /** 提出
     *  @param {object} data 表格行的数据
     */
    handleDeleteRow = (data) => {

    }

    render() {
        const { tableLoading, tableData, isDeatilModalShow } = this.state;

        return (
            <Fragment>
                <div className="sd-filter-form">
                    <span className="title">任务名称{this.context.taskName}详情</span>
                    <div style={{ float: 'right' }}>
                        <Input.Search
                            placeholder="请输入主机名称、机房"
                            style={{ width: 252 }}
                            onChange={e => this.handleSearch(e.target.value)}
                        />
                    </div>
                </div>
                <IPTable
                    className="task-table-wrapper"
                    rowKey="host"
                    loading={tableLoading}
                    columns={this.columns}
                    dataSource={tableData}
                    scroll={{ y: 300, x: true }}
                    pagination={false}
                    expandIcon={() => <span />}
                    expandedRowKeys={this.expandedRowKeys}
                    expandedRowRender={(record, index) => this.renderIpSettingArea(record, index)}
                />
                <ExecutionBtn>执行</ExecutionBtn>
                <SDModal
                    title="绑定详情"
                    visible={isDeatilModalShow}
                    onCancel={this.toggleDetailModal}
                >

                </SDModal>
            </Fragment>
        )
    }
}

class IpSetItem extends Component {

    /** 改变输入值
     * @param {string} type： 改变项 
     * @param {string} val ：改变后的值
     */
    handleChangeVal = (type, val) => {
        const { parentId, index, handleChange } = this.props;
        handleChange(type, val, parentId, index);
    }

    render() {
        const { canDel, parentId, index, item, handleDealIpItem } = this.props;
        return (
            <IPSetItemContainer>
                <span>IP{item.index + 1}</span>

                <IpInput
                    index={`ipset${parentId}_${item.index}`}
                    ip={item.ipUrl}
                    onChangeIp={(ip) => this.handleChangeVal('ipUrl', ip)}
                />

                <span style={{ display: 'inline-block', width: 56 }}>
                    <AddBtn onClick={() => handleDealIpItem('add', parentId)}>+</AddBtn>
                    {
                        canDel && <DelBtn onClick={() => handleDealIpItem('del', parentId, index)}>-</DelBtn>
                    }
                </span>

                {
                    (item.netCard || []).map(data => <span className="net-card-item" key={data}>{data}</span>)
                }
            </IPSetItemContainer>
        )
    }
}

export default TaskSetIp;