/**
 * author: Hans
 * email: hans01@foxmail.com
 * date: 2018/11/16
 * time: 17:41
 */

import Datastore from 'nedb'
import path from 'path'
import { remote } from 'electron'

let dbpath = path.join(remote.app.getPath('userData'), 'db/device.db')

export default new Datastore({
    autoload: true,
    filename: dbpath
});