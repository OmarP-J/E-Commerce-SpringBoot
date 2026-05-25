package com.codeshift.ecom.Services.Admin.Coupon;

import com.codeshift.ecom.Entity.Coupon;

import java.util.List;

public interface AdminCouponService {

    Coupon createCoupon(Coupon coupon);

    List<Coupon> getAllCoupons();
}
