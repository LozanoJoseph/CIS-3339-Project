

function withOrg(filter,req) {
    return{
        ...filter,
        orgId: req.user.orgId

    };

}
module.exports = {
  withOrg
};