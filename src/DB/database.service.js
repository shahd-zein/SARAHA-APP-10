export const findOne = async ({
    model,
    select='',
    filter={},
    options={}
}={})=>{
    return await model.findOne(filter).select(select)
}