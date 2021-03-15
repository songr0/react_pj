import React from 'react';
import { LeftCircleOutlined } from '@ant-design/icons';
import { Tooltip, Popconfirm, Button, Table } from 'antd';
import { Link } from 'react-router-dom';
import '@/assets/css/IssueLocation.css';
import { get } from '@/request';
import * as urlConfig from '@/urlConfig';
import './Recycle.css';
import intl from 'react-intl-universal';

let winWidth;
class Recycle extends React.Component {
    constructor(props) {
        super(props);
        if ('AbortController' in window) {
            this.controller = new window.AbortController();
        }
        this.state = {
            signal: this.controller.signal,
            projects: [],
            defaultPage: 1,
        };
    }

    componentWillMount() {
        this.getProjectData();
    }

    componentWillUnmount = () => {
        //若有未处理完的请求，则取消（适用于fetch）
        if ('AbortController' in window) {
            this.controller.abort();
        }
    };

    getProjectData() {
        const getProjectsUrl = urlConfig.addProject + '?recycled=1';
        get(
            getProjectsUrl,
            sessionStorage.getItem('userToken'),
            this.state.signal,
        ).then((d) => {
            if (d.code === 200 && d.data) {
                this.setState({
                    projects: d.data,
                });
            }
        });
    }

    //isRecycled为1表示移除至回收站，0表示恢复
    recoverProject(uuid) {
        // const recoverProjectUrl =
        //   urlConfig.recycleListManageUrl + '?projectId=' + uuid + '&isRecycled=0';
        // get(recoverProjectUrl, sessionStorage.getItem('userToken')).then((d) => {
        //   if (d.error) console.error(d.error);
        //   else {
        //     this.getProjectData();
        //   }
        // });
    }

    //从回收站彻底删除一个项目
    deleteProject(deleteURL) {
        fetch(deleteURL, {
            method: 'Delete',
            headers: {
                token: sessionStorage.getItem('userToken'),
            },
        })
            .then((response) => {
                this.getProjectData();
            })
            .catch((err) => {
                console.error(`Request failed. Url = ${deleteURL} . Message = ${err}`);
                return { error: { message: 'Request failed.' } };
            });
        this.timerID = setTimeout(() => this.getProjectData(), 500);
    }

    render() {
        let lastPage = urlConfig.projectRoot === '' ? '/' : urlConfig.projectRoot;
        if (sessionStorage.getItem('lastPage-recycle')) {
            if (
                sessionStorage.getItem('lastPage-recycle') ===
                `${urlConfig.projectRoot}/rawIssue`
            ) {
                if (sessionStorage.getItem('rawIssueRadio'))
                    lastPage = {
                        pathname: `${urlConfig.projectRoot}/rawIssue`,
                        rawIssuePage: sessionStorage.getItem('rawIssueRadio'),
                        developmentRadio: sessionStorage.getItem('developmentRadio'),
                    };
            } else {
                lastPage = sessionStorage.getItem('lastPage-recycle');
            }
        }
        if (sessionStorage.getItem('logOut') === 'true') {
            window.location.href = urlConfig.homepage;
            sessionStorage.removeItem('logOut');
        }
        let { projects, defaultPage } = this.state;
        let columns = [
            {
                title: intl.get('repo name'),
                dataIndex: 'name',
                key: 'name',
                width: (winWidth / 100) * 9,
                className: 'projectList',
                sorter: (a, b) => {
                    if (a.name > b.name) {
                        return 1;
                    } else if (a.name < b.name) {
                        return -1;
                    } else {
                        return 0;
                    }
                },
            },
            {
                title: intl.get('url'),
                dataIndex: 'url',
                width: (winWidth / 100) * 12,
                className: 'projectList',
                sorter: (a, b) => a.age - b.age,
                render: (text) => {
                    return (
                        <Tooltip title={text} overlayClassName="tooltip">
                            <span>{text}</span>
                        </Tooltip>
                    );
                },
            },
            {
                title: intl.get('branch'),
                dataIndex: 'branch',
                width: (winWidth / 100) * 9,
                className: 'projectList',
                render: (text, record) => {
                    return <span> {record.branch}</span>;
                },
            },
            {
                title: intl.get('delete-time'),
                width: (winWidth / 100) * 9,
                dataIndex: 'delete_time',
                className: 'projectList',
                sorter: (a, b) => {
                    return a.age - b.age;
                },
            },
            {
                title: intl.get('action'),
                key: 'action',
                width: 240,
                className: 'projectList',
                render: (text, record) => {
                    return (
                        <div className={'actions'}>
                            <div>
                                <Popconfirm
                                    title={intl.get('recover confirm')}
                                    onConfirm={() => {
                                        this.recoverProject(record.uuid);
                                    }}
                                    okText={intl.get('yes')}
                                    cancelText={intl.get('no')}
                                >
                                    <Button>{intl.get('recover')}</Button>
                                </Popconfirm>
                            </div>
                            <div>
                                <Popconfirm
                                    title={intl.get('delete complete confirm')}
                                    onConfirm={() => {
                                        const deleteURL = urlConfig.addProject + '/' + record.uuid;
                                        this.deleteProject(deleteURL);
                                    }}
                                    okText={intl.get('yes')}
                                    cancelText={intl.get('no')}
                                >
                                    <Button>{intl.get('delete completely')}</Button>
                                </Popconfirm>
                            </div>
                        </div>
                    );
                },
            },
        ];
        let pagination = {
            defaultCurrent: parseInt(defaultPage, 10),
            size: 'small',
            showQuickJumper: true,
            onChange: (current, pageSize) => {
                this.setState({
                    currentPage: current,
                    defaultPage: current,
                });
            },
            pageSize: 10,
            total: projects.length,
        };
        return (
            <div id={'recyclePage'}>
                <div className={'issloca'}>
                    <div id={'recycleTitle'}>
            <span style={{ marginRight: '10px' }}>
              <Link to={lastPage}>
                <LeftCircleOutlined style={{ fontSize: '20px' }} />
              </Link>
            </span>
                        <span>{intl.get('recycle bin')}</span>
                    </div>
                </div>
                <div id={'recycleContent'} className={'block'}>
                    <div id={'projectsListTitle'}>{intl.get('deleted repos')}</div>
                    <div id={'projectsList'}>
                        <Table
                            columns={columns}
                            dataSource={projects}
                            pagination={pagination}
                        />
                    </div>
                </div>
            </div>
        );
    }
}

//获得屏幕可视宽度
// const getWinWidth = () => {
//   if (window.innerWidth) winWidth = window.innerWidth;
//   else if (document.body && document.body.clientWidth)
//     winWidth = document.body.clientWidth;
//   if (document.documentElement && document.documentElement.clientWidth)
//     winWidth = document.documentElement.clientWidth;
// };

export default Recycle;
