import React from 'react';
import * as urlConfig from '@/urlConfig';
import { Link } from 'react-router-dom';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Input, Button, Checkbox } from 'antd';
import { LoginGet, get } from '@/request';
import './styles.css';
import intl from 'react-intl-universal';

//表单
const FormItem = Form.Item;

//登录框
class LoginForm extends React.Component {
    handleSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                // console.log('Received values of form: ', values);
            }
            const GetUrl =
                urlConfig.LoginUrl +
                '?username=' +
                '&password=' +
                Base64.encode(values.password);
            // console.log(values.password);
            LoginGet(GetUrl).then((data) => {
                // console.log(data);
                if (data.error) {
                    console.log(data.error.message || 'login failed');
                } else {
                    if (data.code === 200) {
                        sessionStorage.setItem("test", data.data.token);
                        sessionStorage.setItem('userName', data.data.username);
                        sessionStorage.setItem('type', 'sonarqube');
                        sessionStorage.setItem('right', data.data.right);
                        const getUserRightUrl =
                            urlConfig.getUserRight + '?accountName=' + data.data.username;
                        get(getUserRightUrl, sessionStorage.getItem('userToken')).then(
                            (d) => {
                                if (d) {
                                    if (d.length !== 0) {
                                        sessionStorage.setItem('userRight', d[0].account_right);
                                        let allRole = [],
                                            supRole = '';
                                        for (let project of d) {
                                            allRole.push(project.account_role);
                                        }
                                        sessionStorage.setItem('userRole', supRole);
                                    } else {
                                        sessionStorage.setItem('userRight', '0');
                                    }
                                }
                            },
                        );
                        this.login();
                    } else alert(intl.get('error account or password'));
                }
            });
        });
    };

    test(){
        
    }

    render() {
        return (
            <div>
                <div id={'loginFormTitle'}>
                    <img className={'logo'} src={logo} alt={'logo'} />
                    {intl.get('title')}
                </div>
                <Form onSubmit={this.handleSubmit} className="login-form">
                    <FormItem>
                        {getFieldDecorator('userName', {
                            rules: [
                                {
                                    required: true,
                                    message: intl.get('Please input your username!'),
                                },
                            ],
                        })(
                            <div>
                                <div className={'formItemTitle'}>{intl.get('Username')}</div>
                                <Input placeholder={intl.get('input username')} />
                            </div>,
                        )}
                    </FormItem>
                    <FormItem>
                        {getFieldDecorator('password', {
                            rules: [
                                {
                                    required: true,
                                    message: intl.get('Please input your Password!'),
                                },
                            ],
                        })(
                            <div>
                                <div className={'formItemTitle'}>{intl.get('Password')}</div>
                                {/*<Input*/}
                                {/*    type="password"*/}
                                {/*    placeholder={intl.get('input password')}*/}
                                {/*/>*/}
                            </div>,
                        )}
                    </FormItem>
                    <FormItem>
                        {getFieldDecorator('remember', {
                            valuePropName: 'checked',
                            initialValue: true,
                        })(<Checkbox>{intl.get('Remember me')}</Checkbox>)}
                        <a className="login-form-forgot" href="">
                            {intl.get('Forgot password')}
                        </a>
                        {/*<br />*/}
                        <Button
                            type="primary"
                            htmlType="submit"
                            className="login-form-button"
                        >
                            {intl.get('Log in')}
                        </Button>
                        {intl.get('Or')}{' '}
                        <Link to={`${urlConfig.projectRoot}/register`}>
                            {intl.get('register now!')}
                        </Link>
                    </FormItem>
                </Form>
            </div>
        );
    }
}

//登陆框组件必须用WrappedNormalLoginForm不然报错
const WrappedNormalLoginForm = null;
export default WrappedNormalLoginForm;
