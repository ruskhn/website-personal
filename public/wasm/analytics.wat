;; Minimal analytics kernel — count + sum records above a spend threshold.
;; Mirrors the Stackline WASM filter step (typed buffer in, aggregates out).
(module
  (memory (export "memory") 256)

  ;; values: interleaved f64 [spend, retention] * n
  ;; returns: i32 count written; also writes f64 sum_spend, f64 sum_retention at out_ptr
  (func (export "aggregate_above")
    (param $ptr i32) (param $len i32) (param $threshold f64) (param $out i32) (result i32)
    (local $i i32)
    (local $count i32)
    (local $sum_s f64)
    (local $sum_r f64)
    (local $spend f64)
    (local $ret f64)
    (local $base i32)

    (local.set $i (i32.const 0))
    (local.set $count (i32.const 0))
    (local.set $sum_s (f64.const 0))
    (local.set $sum_r (f64.const 0))

    (block $done
      (loop $loop
        (br_if $done (i32.ge_u (local.get $i) (local.get $len)))

        (local.set $base
          (i32.add
            (local.get $ptr)
            (i32.mul (local.get $i) (i32.const 16))))

        (local.set $spend (f64.load (local.get $base)))
        (local.set $ret (f64.load (i32.add (local.get $base) (i32.const 8))))

        (if (f64.ge (local.get $spend) (local.get $threshold))
          (then
            (local.set $count (i32.add (local.get $count) (i32.const 1)))
            (local.set $sum_s (f64.add (local.get $sum_s) (local.get $spend)))
            (local.set $sum_r (f64.add (local.get $sum_r) (local.get $ret)))
          )
        )

        (local.set $i (i32.add (local.get $i) (i32.const 1)))
        (br $loop)
      )
    )

    (f64.store (local.get $out) (local.get $sum_s))
    (f64.store (i32.add (local.get $out) (i32.const 8)) (local.get $sum_r))
    (local.get $count)
  )

  ;; Filter points into an output buffer for scatter plotting.
  ;; in: [x,y,spend] * n as f64 triples (24 bytes)
  ;; out: compacted [x,y] pairs for points where spend >= threshold
  ;; returns count of kept points
  (func (export "filter_scatter")
    (param $in i32) (param $len i32) (param $threshold f64) (param $out i32) (result i32)
    (local $i i32)
    (local $kept i32)
    (local $base i32)
    (local $obase i32)
    (local $spend f64)

    (local.set $i (i32.const 0))
    (local.set $kept (i32.const 0))

    (block $done
      (loop $loop
        (br_if $done (i32.ge_u (local.get $i) (local.get $len)))

        (local.set $base
          (i32.add
            (local.get $in)
            (i32.mul (local.get $i) (i32.const 24))))

        (local.set $spend (f64.load (i32.add (local.get $base) (i32.const 16))))

        (if (f64.ge (local.get $spend) (local.get $threshold))
          (then
            (local.set $obase
              (i32.add
                (local.get $out)
                (i32.mul (local.get $kept) (i32.const 16))))
            (f64.store (local.get $obase) (f64.load (local.get $base)))
            (f64.store
              (i32.add (local.get $obase) (i32.const 8))
              (f64.load (i32.add (local.get $base) (i32.const 8))))
            (local.set $kept (i32.add (local.get $kept) (i32.const 1)))
          )
        )

        (local.set $i (i32.add (local.get $i) (i32.const 1)))
        (br $loop)
      )
    )

    (local.get $kept)
  )
)
