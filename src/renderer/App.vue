<template>
    <div id="app">
        <div id="layout">
            <!-- todo 列表 -->
            <Row>
                <Col span="14" offset="5">
                    <div class="todo">
                        <ul>
                            <li v-for="item in list" :key="item._id">
                                <div v-show="!item.edit" class="list-item" :key="item._id + 'show'">
                                    <span class="task-content">
                                        <Radio size="large" @on-change="finishTask(item._id)" :key="item._id">
                                        </Radio>
                                        <span v-html="item.content"></span>
                                    </span>
                                    <span>
                                        <Dropdown class="drop-down">
                                             <Icon type="ios-more" class="task-more" size="25"/>
                                             <DropdownMenu slot="list">
                                                <DropdownItem class="drop-down-item">
                                                    <p @click="editTask(item._id)">
                                                        <Icon type="ios-create-outline" size="22"/>编辑
                                                    </p>
                                                </DropdownItem>
                                                <DropdownItem>
                                                    <p @click="deleteTask(item._id)">
                                                        <Icon type="ios-trash-outline" size="22"/>删除
                                                    </p>
                                                </DropdownItem>
                                            </DropdownMenu>
                                        </Dropdown>
                                    </span>
                                </div>

                                <div class="task-option" v-show="item.edit">
                                    <p class="task-input">
                                        <Input placeholder="例如: 今天6点起床..." v-model="editContainer[item._id]"/>
                                    </p>
                                    <p>
                                        <Button type="error" @click="updateTask(item._id)">保存</Button>
                                        &nbsp;
                                        <Button type="text" @click="editTaskCancel(item._id)">取消</Button>
                                    </p>
                                </div>
                            </li>

                        </ul>
                    </div>
                </Col>
            </Row>
            <!-- 任务添加框 -->
            <Row>
                <Col span="14" offset="5">
                    <div class="task-option" v-show="addShow">
                        <p class="task-input">
                            <Input placeholder="例如: 今天6点起床..." v-model="task"/>
                        </p>
                        <p>
                            <Button type="error" @click="addTask">添加任务</Button>
                            &nbsp;
                            <Button type="text" @click="addTaskCancel">取消</Button>
                        </p>
                    </div>
                </Col>
            </Row>

            <!-- 添加任务栏 -->
            <Row>
                <Col span="14" offset="5">
                    <div class="add-task">
                  <span @mouseover="taskEnter" @mouseleave="taskOut" @click="showAddTask">
                      <Icon :type="taskIcon" color="#dd4b39" size="25"/>
                      添加任务
                  </span>
                        <Tooltip content="显示已完成任务" placement="right">
                            <Icon type="ios-ionic" size="25" color="gray" class="show-history-icon"
                                  v-show="showHistoryIcon" @click="getHistories"/>
                        </Tooltip>
                    </div>
                </Col>
            </Row>

            <!-- finished task -->
            <Row>
                <Col span="14" offset="5">
                    <div class="finished-task">
                        <ul>
                            <li v-for="item in finishedList" :key="item._id">
                                <div class="list-item" :key="item._id + 'show'">
                                    <span class="task-content">
                                        <Icon type="ios-checkmark-circle-outline" size="20"/>
                                        <span v-html="item.content"></span>
                                    </span>
                                </div>
                            </li>
                        </ul>
                        <p :class="['get-more', red ? 'red' : 'grey']" @click="getMore" v-if="finishedList.length" v-html="tip"></p>
                    </div>
                </Col>
            </Row>
        </div>
    </div>
</template>

<script>

    export default {
        name: 'todolist',
        mounted() {
            // 获取任务列表
            this.$db.find({finished: 0}).sort({created_at: 1}).exec((err, docs) => {
                this.list = docs;
                this.task = '';
            })
        },
        data() {
            return {
                taskIcon: 'ios-add',
                showHistoryIcon: true,
                addShow: false,
                task: '',
                list: [],
                editContainer: {},
                finishedList: [],
                page: 1,
                limits: 5,
                tip: '获取更多...',
                red: true
            }
        },
        methods: {
            /** 添加任务移入 */
            taskEnter() {
                this.taskIcon = 'ios-add-circle';
            },
            /** 添加任务移出 */
            taskOut() {
                this.taskIcon = 'ios-add'
            },
            /** 获取记录历史 */
            getHistories() {
                if(this.finishedList.length > 0){
                    this.finishedList = [];
                    this.red = true;
                    this.tip = '获取更多...';
                    this.page = 1;
                }else{
                    this.getMore();
                }
            },
            /** 展示添加窗口 */
            showAddTask() {
                this.addShow = true;    // 展示添加任务窗口
            },
            /** 添加窗口隐藏 */
            addTaskCancel() {
                this.addShow = false;
                this.task = '';
            },
            /** 添加任务 */
            addTask() {
                if (this.task) {
                    let doc = {
                        content: this.task, // 任务内容
                        finished: 0,    // 是否完成
                        created_at: this.getTimestamp(),     // 创建时间,
                    }

                    // 插入新纪录
                    this.$db.insert(doc, (err, newDoc) => {
                        // 查询出未完成的记录, 更新列表
                        this.$db.find({finished: 0}).sort({created_at: 1}).exec((err, docs) => {
                            this.list = docs;
                            this.task = '';
                        })
                    })
                }
            },
            /** 获取当前时间戳 */
            getTimestamp() {
                return Math.round((new Date()).valueOf() / 1000);
            },
            /** 删除当前任务 */
            deleteTask(id) {
                console.log('delete task --------------');
                this.$db.remove({_id: id}, {}, (err, numRemoved) => {
                    // 查询出未完成的记录, 更新列表
                    this.$db.find({finished: 0}).sort({created_at: 1}).exec((err, docs) => {
                        this.list = docs;
                        this.task = '';
                    })
                });
            },
            /** 任务完成 */
            finishTask(id) {
                console.log('finish task --------------');
                this.$db.update({_id: id}, {
                    $set: {
                        finished: 1,
                        finished_at: this.getTimestamp()
                    }
                }, {
                    multi: true
                }, (err, numReplaced) => {
                    // 查询出未完成的记录, 更新列表
                    this.$db.find({finished: 0}).sort({created_at: 1}).exec((err, docs) => {
                        this.list = docs;
                        this.task = '';
                    })
                })
            },
            /** 任务完成 */
            editTask(id) {
                console.log('edit task ---------------');
                this.list.map((item, index) => {
                    if (item._id == id) {
                        this.$set(this.editContainer, item._id, item.content)
                        this.$set(this.list[index], 'edit', true)
                        console.log('editContainer-----------------')
                        console.log(this.editContainer);
                    }
                })

            },
            /** 取消任务编辑 */
            editTaskCancel(id) {
                this.list.map((item, index) => {
                    if (item._id == id) {
                        this.$set(this.list[index], 'edit', false)
                    }
                })
            },
            /** 任务更新 */
            updateTask(id) {
                console.log('update task ---------------');
                console.log(this.editContainer[id]);
                this.$db.update({_id: id}, {
                    $set: {
                        content: this.editContainer[id],
                    }
                }, {
                    multi: true
                }, (err, numReplaced) => {
                    // 查询出未完成的记录, 更新列表
                    this.$db.find({finished: 0}).sort({created_at: 1}).exec((err, docs) => {
                        this.list = docs;
                        this.task = '';
                    })
                })
            },
            /** 获取更多 */
            getMore(){
                let skip = (this.page - 1 ) * this.limits;
                // 查询出未完成的记录, 更新列表
                this.$db.find({finished: 1}).sort({finished_at: 1}).skip(skip).limit(this.limits).exec((err, docs) => {
                    if(docs.length > 0){
                        this.finishedList = this.finishedList.concat(docs);
                        this.page++;
                    }else{
                        this.red = false;
                        this.tip = '没有更多已完成的任务'
                    }
                })
            }
        }
    }
</script>

<style lang="scss">
    ul, li {
        padding: 0;
        margin: 0;
        list-style: none
    }

    #layout {
        font-size: 14px;
        margin: 2rem 0;

        .todo {
            margin-bottom: 10px;

            ul {
                li {
                    font-size: 14px;
                    padding-top: 10px;
                    padding-bottom: 5px;
                    border-bottom: #eeeeee 1px solid;

                    .list-item {
                        display: -webkit-flex;
                        display: flex;
                        justify-content: space-between;
                    }

                    .task-content {
                        text-overflow: ellipsis;
                        -o-text-overflow: ellipsis;
                        white-space: nowrap;
                        overflow: hidden;
                        align-items: baseline;
                    }

                    .task-more {
                        display: none;
                        cursor: pointer;
                        line-height: 14px;
                    }

                }
                li:hover {
                    .task-more {
                        display: initial;
                    }
                }
            }
        }

        .add-task {
            display: -webkit-flex;
            display: flex;
            justify-content: space-between;

            span {
                cursor: pointer;
                color: gray;
            }
            .show-history-icon {
                cursor: pointer;
            }
        }

        .task-option {
            padding-bottom: 8px;

            .task-input {
                margin-bottom: 5px;
            }
        }

        .finished-task{
            margin-top: 10px;

            ul {
                li {
                    font-size: 14px;
                    padding-top: 10px;
                    padding-bottom: 5px;
                    border-bottom: #eeeeee 1px solid;

                    .task-content {
                        text-overflow: ellipsis;
                        -o-text-overflow: ellipsis;
                        white-space: nowrap;
                        overflow: hidden;
                    }
                }
            }

            .get-more {
                margin-top: 3px;
                cursor: pointer;
            }
        }

        .red{
            color: #dd4b39;
        }
        .grey{
            color: gainsboro;
        }
    }
</style>
