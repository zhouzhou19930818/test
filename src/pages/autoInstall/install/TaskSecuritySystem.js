import React, { Fragment } from 'react';
import SDTable from 'src/components/SDTable';
import { message, Divider } from "antd";
import { reduxMapper } from "src/redux/modules/diskTrouble";
import Context from "./Context";
import api from 'src/tools/api';
import { debounce } from "src/tools/utils";

// 0未装机，1已装机，2正在装机，3装机异常
const allStatus = ['未装机', '已装机', '正在装机', '装机异常', '人工修复（已装机）'];

class TaskSecuritySystem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            dataSource: [],
            selectedRowKeys: [],
            tableLoading: true,
            scrollY: undefined,
            automaticBaseTaskId:'',
        };
    }

    static contextType = Context;

    columns = [
        {
            title: '序列号',
            dataIndex: 'taskName',
            key: 'taskName',
            width: 120,
            render(text) {
                return (
                    <span style={{ cursor: 'pointer' }}>{text}</span>
                )
            }
        },
        {
            title: 'mac地址',
            dataIndex: 'mac',
            key: 'mac',
            width: 120,
        },
        {
            title: '机房',
            dataIndex: 'roomName',
            key: 'roomName',
            width: 100,
        },
        {
            title: '操作系统',
            dataIndex: 'dcnIp',
            key: 'dcnIp',
            width: 160,
        },
        {
            title: '状态',
            dataIndex: 'baseTaskStatus',
            key: 'baseTaskStatus',
            width: 100,
            render: (status) => <span style={{
                color: status === 5 ? '#008364' : '#213555',
                background: status === 5 ? '#EAF8E5' : '#D2F1FF',
                display: 'inline-block',
                width: '48px',
                height: '24px',
                lineHeight: '24px',
                borderRadius: '2px'
            }}>{allStatus[status]}</span>,
        },
        {
            title: '操作',
            dataIndex: 'op',
            width: '10%',
            render: (d, record) => {
                return (
                    <Fragment>
                        <button
                            key="btn_1"
                            className="sd-anchor-button"
                            style={{ color: '#0E6EDF' }}
                            onClick={() => this.onDetailShow(record)}
                        >
                            详情
                        </button>
                        {
                            record.status === 10 ? (
                                <Fragment>
                                    <Divider type="vertical" />
                                    <button
                                        key="btn_2"
                                        className="sd-anchor-button"
                                        style={{ color: '#0E6EDF' }}
                                        onClick={() => this.artificialRestorationProcess(record)}
                                    >
                                        人工修复
                                    </button>
                                </Fragment>
                            ) : null
                        }
                    </Fragment>
                )
            }
        },

    ];

    componentWillReceiveProps(nextProps, nextContext) {
        console.log(nextProps.automaticBaseTaskId)
        // 从"未完成任务"获取automaticBaseTaskId
        if (nextProps.automaticBaseTaskId !== this.state.automaticBaseTaskId) {
            this.setState({
                automaticBaseTaskId:nextProps.automaticBaseTaskId,
            })
            this.getList(nextProps.automaticBaseTaskId);
        }
        // websocket 更新
        if (nextProps.websocketMsg) {
            debounce(() => this.getList(nextProps.automaticBaseTaskId));
        }
    }
    componentDidMount() {
        this.getList();
    }

    getList = (baseTaskId) => {
        console.log(this.props.automaticBaseTaskId)
        if (!this.state.tableLoading) this.setState({ tableLoading: true });
        api.getHostByBaseTaskId().then(res => {
            if (res.data.success !== 'true') {
                this.setState({ tableLoading: false });
                message.error(res.data.msg);
                return;
            }
            this.setState({
                tableLoading: false,
                dataSource: res.data.data,
                selectedRowKeys: res.data.data.map(d => d.automaticBaseTaskId),
            });
        });
    };
    render() {
        const state = this.state;
        return (
            <Fragment>
                <SDTable
                    rowKey="id"
                    id="testclick"
                    columns={this.columns}
                    dataSource={state.dataSource}
                    scroll={{ y: 200 }}
                />
            </Fragment>
        )
    }
}
export default reduxMapper(TaskSecuritySystem);