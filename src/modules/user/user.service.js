import {UserModel} from '../../DB/model/index.js'

export const profile   = (id)=>{
    const user = UserModel.find(ele => ele.id == id)
    return user
}