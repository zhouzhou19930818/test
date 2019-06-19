// 创建装机任务
import React, { Component} from 'react';
// import PropTypes from 'prop-types';
import { message, Modal, Row, Button, Input, Upload } from 'antd';
// import update from 'immutability-helper';
import Context from './Context';
import SDTable from 'src/components/SDTable';
import api from 'src/tools/api';
import { downloadFile } from "src/tools/utils";

import './installTaskCreate.scss';


export default class TaskHostPicker extends Component {
    static contextType = Context;

    state = {
        dataSource:[],
        tableLoading: true,
        uploading: false,
        selectedRowKeys: [],
    };

    columns = [
        {
            title: 'mac地址',
            dataIndex: 'mac',
            key: 'mac',
            width: 120,
        },
        {
            title: '主机名',
            dataIndex: 'roomNamess',
            key: 'roomNamess',
            width: 100,
        },
        {
            title: '机房',
            dataIndex: 'roomName',
            key: 'roomName',
            width: 100,
        },
        {
            title: '管理口IP地址',
            dataIndex: 'dcnIp',
            key: 'dcnIp',
            width: 160,
        },
        {
            title: '管理口用户名',
            dataIndex: 'hostName',
            key: 'hostName',
            width: 160,
        },
        {
            title: '管理口密码',
            dataIndex: 'sn',
            key: 'sn',
            width: 120,
            align: "center",
        },
        {
            title: '所属项目',
            dataIndex: 'roomNames',
            key: 'roomNames',
            width: 100,
            align: "center",
        },
    ];


    uploadProps = {
        accept: '.xls,.xlsx',
        showUploadList: false,
        beforeUpload: (file) => {
            this.setState({ uploading: true });
            const formData = new FormData();
            formData.append('file', file);

            api.importHostExcel(formData).then(res => {
                if (res.data.success !== 'true') {
                    this.setState({ uploading: false });
                    message.error(res.data.msg);
                    return;
                }
                this.setState({ uploading: false });
                message.success('导入成功');
                const data = res.data.data;
                const oldIds = this.context.task.hostId ? this.context.task.hostId + ',' : '';
                this.context.changeState({
                    task: {
                        hostIds: { $set: oldIds + data.join(',') }
                    }
                }, 'hostPick', 'getList');
            });
            return false;
        },
    };

    componentDidMount() {
        this.getList();
    }

    getList = () => {
        if (!this.state.tableLoading) this.setState({ tableLoading: true });
        api.getAllHost().then(res => {
            if (res.data.success !== 'true') {
                this.setState({ tableLoading: false });
                message.error(res.data.msg);
                return;
            }
            console.log(this.context.task.hostIds)
            // console.log(lastRes)
            const hostIds = this.context.task.hostIds ? this.context.task.hostIds.split(',') : [];
           
            this.setState({
                tableLoading: false,
                selectedRowKeys: hostIds,
                dataSource: res.data.data,
            });
        }).catch(() => {
            this.setState({ tableLoading: false });
        });
    };



    next = () => {
        if ( this.state.selectedRowKeys.length<1) {
            Modal.warn({ title: '请选择至少一个主机' });
            return false;
        }
        this.setState({
            current: this.state.current + 1,
        });
        return true;
    };



    onRowSelect = (selectedRowKeys) => {
        this.setState({ selectedRowKeys }, () => {
            this.props.changeState({
                task: {
                    hostIds: { $set: selectedRowKeys.join(',') }
                }
            })
        });
    };

    render() {
        const state = this.state;
        const props = this.props;
        return (
            <div style={ {
                width: '80%',
                maxWidth: '1000px',
                padding: '20px',
                overflowY: 'auto',
            } }>
                <Row style={ { marginBottom: '24px' } }>
                    <Upload { ...this.uploadProps }>
                        <Button htmlType="button"
                                type="primary"
                                className="sd-wireframe"
                                style={ { marginRight: '8px' } }
                                loading={ this.state.uploading }
                        >导入资源</Button>
                    </Upload>
                    <Input.Search
                        onSearch={ this.onSearchChange }
                        placeholder="请输入机房名称"
                        style={ { float: 'right', margin: '8px 30px', width: '230px',marginRight:'15px'  } }
                    />
                    <Button htmlType="button"
                            type="primary"
                            className="sd-wireframe"
                            onClick={ () => api.downHostExcel().then(res => downloadFile(res)) }
                    >下载模板</Button>
                </Row>
                <SDTable
                    // id='importSource'
                    // rowKey='automaticModelId' 
                    // className="sd-table-simple"
                    columns={ this.columns }
                    dataSource={ state.dataSource }
                    rowSelection={ {
                        selectedRowKeys: state.selectedRowKeys,
                        onChange: this.onRowSelect,
                    } }
                    bordered={ true }
                    pagination={ true }
                    loading={ props.tableLoading }
                    scroll={{x:true, y: 200 }}
                />
            </div>
        )
    }
}


