import { fetch } from "../fetch";
import * as types from "../types";
import { sign, toXML } from "../utils";
import PayBase from "./PayBase";

const CLOSE_ORDER_BASE = "/pay/closeorder";
const UNIFIED_ORDER_BASE = "/pay/unifiedorder";
/**
 * `PayBase` 基础上添加方法 `closeOrder`, `payNotify`，是公众号支付，扫码支付，APP支付，H5支付，和小程序支付的基类
 */
export default class PayFund extends PayBase {
  /**
   * 关闭订单
   * @see {@link https://pay.weixin.qq.com/wiki/doc/api/jsapi.php?chapter=9_3}
   */
  public async closeOrder(options: types.CloseOrderOptions) {
    const url = this.completeURL(CLOSE_ORDER_BASE);
    const extra = await this.createFetchOptions(url);
    return fetch<
      types.CloseOrderOptions,
      types.CloseOrderSuccess,
      types.CloseOrderFail
    >(options, extra);
  }

  /**
   * 支付结果通知
   * @see {@link https://pay.weixin.qq.com/wiki/doc/api/jsapi.php?chapter=9_7&index=8}
   */
  public async payNotify(
    info: types.PayNotifySuccess | types.PayNotifyFail,
    handler: types.PayNotifyHandler
  ) {
    if (info.return_code === "FAIL") {
      return toXML({
        return_code: info.return_code,
        return_msg: info.return_msg
      });
    }
    const key = this.getKey();
    const checkSign = sign(info.sign_type, info, key);
    if (checkSign !== info.sign) {
      return toXML({
        return_code: "FAIL",
        return_msg: "签名失败"
      });
    }
    const result = await handler(info);
    return toXML(result);
  }

  /**
   * 统一下单
   */
  protected async unifiedOrderBase<T extends types.UnifiedOrderOptionsBase>(
    options: T
  ) {
    const url = this.completeURL(UNIFIED_ORDER_BASE);
    const extra = await this.createFetchOptions(url);
    return fetch<T, types.UnifiedOrderSuccess, types.UnifiedOrderFail>(
      options,
      extra
    );
  }
}