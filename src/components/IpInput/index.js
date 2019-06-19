import React, { Component } from 'react';
import './index.scss';

class IpInput extends Component {
    constructor(props) {
        super(props)
        const { ip = "" } = props
        this.state = {
            errorMsg: ''
        }
        // ip地址4个输入框
        this.IpFirst = ''
        this.IpSecond = ''
        this.IpThird = ''
        this.IpFourth = ''

        if (ip) {
            const reg = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/
            const isIp = reg.test(ip) //验证正则
            this.IpAddress = ip.split('.')
            this.IpFirst = this.IpAddress[0]
            this.IpSecond = this.IpAddress[1]
            this.IpThird = this.IpAddress[2]
            this.IpFourth = this.IpAddress[3]

            if (!isIp) {
                this.setState({
                    errorMsg: '请输入正确的IP地址'
                })
            }
        }
    }

    // 修改ip Input 框
    changeIpInputAll = (e) => {
        this.changIpInput(e)
        const ip = `${this.IpFirst}.${this.IpSecond}.${this.IpThird}.${this.IpFourth}`
        this.props.onChangeIp(ip)
    }
    // 修改ipinput
    changIpInput = (e) => {
        const input = document.getElementById(e.target.id)//当前输入框
        const nextInput = input.nextElementSibling //下一个输入框
        const value = e.target.value
        const realInputIndex = e.target.id.split('_')[2];
        if (value.length > 3) {
            if (nextInput) {
                nextInput.focus()
                nextInput.selectionStart = nextInput.value.length;
                nextInput.selectionEnd = nextInput.value.length
                if (!nextInput.value) {
                    nextInput.value = value.slice(3, 4)
                    this[nextInput.getAttribute("id")] = value.slice(3, 4)
                }
            } else {
                this[realInputIndex] = value.slice(0, 3)
            }
            e.target.value = this[realInputIndex]
        } else if (value.length === 3 && nextInput) {
            nextInput.focus()
            nextInput.selectionStart = nextInput.value.length;
            nextInput.selectionEnd = nextInput.value.length
            this[realInputIndex] = value ? value : ''
        } else {
            this[realInputIndex] = value ? value : ''
        }

        const ipArr = [this.IpFirst, this.IpSecond, this.IpThird, this.IpFourth]
        const reg = /^\d{0,3}$/
        const errorIp = ipArr.filter(item => parseInt(item, 10) > 255 || (!reg.test(item)))
        if (errorIp.length) {
            this.setState({
                errorMsg: '请输入正确的IP地址'
            })
        } else {
            this.setState({
                errorMsg: ''
            })
        }
    }

    keyInput = (e) => {
        const input = document.getElementById(e.target.id)  //当前输入框
        const preInput = input.previousElementSibling //上一个输入框
        const nextInput = input.nextElementSibling //下一个输入框
        const currentPosition = input.selectionEnd
        const currentValueLen = input.value.length

        switch (e.keyCode) {
            case 37:
                if (preInput && !currentPosition) {
                    preInput.focus();
                    preInput.selectionEnd = 3;
                }
                break
            case 39:
                if (nextInput && (currentPosition === currentValueLen)) {
                    nextInput.focus();
                    nextInput.selectionStart = nextInput.value.length;
                    nextInput.selectionEnd = nextInput.value.length;
                }
                break
            case 8:
                if (preInput && !input.selectionEnd) {
                    preInput.focus();
                    preInput.selectionStart = preInput.value.length;
                    preInput.selectionEnd = preInput.value.length;
                }
                break
            default:
                break
        }
    }

    handleCheckOnBlur = (e) => {
        if (this.IpFirst && this.IpSecond && this.IpThird && this.IpFourth) return;
        this.setState({
            errorMsg: '请输入完整的地址'
        })
    }

    render() {
        const { errorMsg } = this.state;
        const { index } = this.props;

        return (
            <div>
                <div
                    className={`ip-container ${!errorMsg ? '' : 'err-ip'}`}
                    onChange={(e) => this.changeIpInputAll(e)}
                    onKeyUp={(e) => this.keyInput(e)}
                    onBlur={(e) => { this.handleCheckOnBlur(e) }}
                >
                    <input
                        id={`${index}_IpFirst`}
                        autoComplete="off"
                        defaultValue={this.IpAddress ? this.IpAddress[0] : ''} />.
                    <input
                        id={`${index}_IpSecond`}
                        autoComplete="off"
                        defaultValue={this.IpAddress ? this.IpAddress[1] : ''} />.
                    <input
                        id={`${index}_IpThird`}
                        autoComplete="off"
                        defaultValue={this.IpAddress ? this.IpAddress[2] : ''} />.
                    <input
                        id={`${index}_IpFourth`}
                        autoComplete="off"
                        defaultValue={this.IpAddress ? this.IpAddress[3] : ''} />
                </div>
                <p className="error-msg">{errorMsg}</p>
            </div>
        )
    }
}

export default IpInput;