import { hookstate, useHookstate } from '../';

import { render } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react-hooks';
import { useEffect, createElement } from 'react';

test('primitive: should rerender stable', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return [useHookstate(0), useHookstate(1)]
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current[0].get()).toStrictEqual(0);
    expect(result.current[1].get()).toStrictEqual(1);

    let state0 = result.current[0];
    let state1 = result.current[0];
    act(() => {
        result.current[1].set(p => p + 1);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current[0].get()).toStrictEqual(0);
    expect(result.current[1].get()).toStrictEqual(2);
    expect(result.current[0] === state0).toBeTruthy();
    expect(result.current[1] !== state1).toBeTruthy();
});

test('object: should rerender stable', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return [useHookstate({a: 0, b: 0}), useHookstate({a: 1, b: 1})]
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current[0].a.get()).toStrictEqual(0);
    expect(result.current[0].b.get()).toStrictEqual(0);
    expect(result.current[1].a.get()).toStrictEqual(1);
    expect(result.current[1].b.get()).toStrictEqual(1);

    let state0 = result.current[0];
    let state1 = result.current[1];
    let state0a = result.current[0].a; 
    let state0b = result.current[0].b;
    let state1a = result.current[1].a;
    let state1b = result.current[1].b;
    expect(state0.a === state0a).toBeTruthy();
    expect(state0.b === state0b).toBeTruthy();
    expect(state1.a === state1a).toBeTruthy();
    expect(state1.b === state1b).toBeTruthy();
    expect(state0.a !== state0.b).toBeTruthy();
    expect(state1.a !== state1.b).toBeTruthy();
    act(() => {
        result.current[1].set(p => p);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current[0].a.get()).toStrictEqual(0);
    expect(result.current[0].b.get()).toStrictEqual(0);
    expect(result.current[1].a.get()).toStrictEqual(1);
    expect(result.current[1].b.get()).toStrictEqual(1);
    expect(result.current[0] === state0).toBeTruthy();
    expect(result.current[1] !== state1).toBeTruthy();
    
    expect(result.current[0].a === state0.a).toBeTruthy();
    expect(result.current[0].b === state0.b).toBeTruthy();
    
    // the following two is an interesting result
    // but it makes sense, because state1 and result.current[1] 
    // refer to the same instance of StateMethodsImpl
    expect(result.current[1].a === state1.a).toBeTruthy();
    expect(result.current[1].b === state1.b).toBeTruthy();
    
    expect(result.current[0].a === state0a).toBeTruthy();
    expect(result.current[0].b === state0b).toBeTruthy();
    expect(result.current[1].a !== state1a).toBeTruthy();
    expect(result.current[1].b !== state1b).toBeTruthy();
});

test('object: should rerender stable nested update', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return [useHookstate({a: 0, b: 0}), useHookstate({a: 1, b: 1})]
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current[0].a.get()).toStrictEqual(0);
    expect(result.current[0].b.get()).toStrictEqual(0);
    expect(result.current[1].a.get()).toStrictEqual(1);
    expect(result.current[1].b.get()).toStrictEqual(1);

    let state0 = result.current[0];
    let state1 = result.current[1];
    let state0a = result.current[0].a; 
    let state0b = result.current[0].b;
    let state1a = result.current[1].a;
    let state1b = result.current[1].b;
    expect(state0.a === state0a).toBeTruthy();
    expect(state0.b === state0b).toBeTruthy();
    expect(state1.a === state1a).toBeTruthy();
    expect(state1.b === state1b).toBeTruthy();
    expect(state0.a !== state0.b).toBeTruthy();
    expect(state1.a !== state1.b).toBeTruthy();
    act(() => {
        result.current[1].b.set(p => p + 1);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current[0].a.get()).toStrictEqual(0);
    expect(result.current[0].b.get()).toStrictEqual(0);
    expect(result.current[1].a.get()).toStrictEqual(1);
    expect(result.current[1].b.get()).toStrictEqual(2);
    expect(result.current[0] === state0).toBeTruthy();
    expect(result.current[1] !== state1).toBeTruthy();
    
    expect(result.current[0].a === state0.a).toBeTruthy();
    expect(result.current[0].b === state0.b).toBeTruthy();
    
    // the following two is an interesting result
    // but it makes sense, because state0 and result.current[0] 
    // refer to the same instance of StateMethodsImpl
    expect(result.current[1].a === state1.a).toBeTruthy();
    expect(result.current[1].b === state1.b).toBeTruthy();
    
    expect(result.current[0].a === state0a).toBeTruthy();
    expect(result.current[0].b === state0b).toBeTruthy();
    expect(result.current[1].a === state1a).toBeTruthy();
    expect(result.current[1].b !== state1b).toBeTruthy();
});

test('object: should rerender only value used', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        let state = useHookstate<{a: {b: number}} | undefined>({a: {b: 0}});
        state.get() // use only object level value
        return state;
    });
    expect(renderTimes).toStrictEqual(1);
    
    act(() => {
        result.current.set(undefined);
    });
    expect(renderTimes).toStrictEqual(2);

    act(() => {
        result.current.set({a: {b: 0}});
    });
    expect(renderTimes).toStrictEqual(3);

    act(() => {
        result.current.set({a: {b: 0}});
    });
    expect(renderTimes).toStrictEqual(4);

    act(() => {
        result.current.ornull?.a.b.set(1);
    });
    expect(renderTimes).toStrictEqual(4);
});

test('primitive: should rerender stable (global)', async () => {
    let renderTimes = 0
    let gs0 = hookstate(0)
    let gs1 = hookstate(1)
    const { result } = renderHook(() => {
        renderTimes += 1;
        return [useHookstate(gs0), useHookstate(gs1)]
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current[0].get()).toStrictEqual(0);
    expect(result.current[1].get()).toStrictEqual(1);

    let state0 = result.current[0];
    let state1 = result.current[0];
    act(() => {
        result.current[1].set(p => p + 1);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current[0].get()).toStrictEqual(0);
    expect(result.current[1].get()).toStrictEqual(2);
    expect(result.current[0] === state0).toBeTruthy();
    expect(result.current[1] !== state1).toBeTruthy();
});

test('object: should rerender stable (global)', async () => {
    let renderTimes = 0
    let gs0 = hookstate({a: 0, b: 0})
    let gs1 = hookstate({a: 1, b: 1})
    const { result } = renderHook(() => {
        renderTimes += 1;
        return [useHookstate(gs0), useHookstate(gs1)]
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current[0].a.get()).toStrictEqual(0);
    expect(result.current[0].b.get()).toStrictEqual(0);
    expect(result.current[1].a.get()).toStrictEqual(1);
    expect(result.current[1].b.get()).toStrictEqual(1);

    let state0 = result.current[0];
    let state1 = result.current[1];
    let state0a = result.current[0].a; 
    let state0b = result.current[0].b;
    let state1a = result.current[1].a;
    let state1b = result.current[1].b;
    expect(state0.a === state0a).toBeTruthy();
    expect(state0.b === state0b).toBeTruthy();
    expect(state1.a === state1a).toBeTruthy();
    expect(state1.b === state1b).toBeTruthy();
    expect(state0.a !== state0.b).toBeTruthy();
    expect(state1.a !== state1.b).toBeTruthy();
    act(() => {
        result.current[1].set(p => p);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current[0].a.get()).toStrictEqual(0);
    expect(result.current[0].b.get()).toStrictEqual(0);
    expect(result.current[1].a.get()).toStrictEqual(1);
    expect(result.current[1].b.get()).toStrictEqual(1);
    expect(result.current[0] === state0).toBeTruthy();
    expect(result.current[1] !== state1).toBeTruthy();
    
    expect(result.current[0].a === state0.a).toBeTruthy();
    expect(result.current[0].b === state0.b).toBeTruthy();
    
    // the following two is an interesting result
    // but it makes sense, because state1 and result.current[1] 
    // refer to the same instance of StateMethodsImpl
    expect(result.current[1].a === state1.a).toBeTruthy();
    expect(result.current[1].b === state1.b).toBeTruthy();
    
    expect(result.current[0].a === state0a).toBeTruthy();
    expect(result.current[0].b === state0b).toBeTruthy();
    expect(result.current[1].a !== state1a).toBeTruthy();
    expect(result.current[1].b !== state1b).toBeTruthy();
});

test('object: should rerender stable with deep mutation (global)', async () => {
    let renderTimes = 0
    let gs0 = hookstate({a: {b: {c: 0}, d: {}}})
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useHookstate(gs0)
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current.a.get().b.c).toStrictEqual(0);

    let state0 = result.current;
    let state0a = result.current.a; 
    let state0ab = result.current.a.b;
    let state0abc = result.current.a.b.c;
    let state0ad = result.current.a.d;
    expect(state0.a === state0a).toBeTruthy();
    expect(state0.a.b === state0ab).toBeTruthy();
    expect(state0.a.b.c === state0abc).toBeTruthy();
    expect(state0.a.d === state0ad).toBeTruthy();
    act(() => {
        result.current.a.b.c.set(42);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current !== state0).toBeTruthy();
    expect(result.current.a !== state0a).toBeTruthy();
    expect(result.current.a.b !== state0ab).toBeTruthy();
    expect(result.current.a.b.c !== state0abc).toBeTruthy();
    expect(result.current.a.b.c.get()).toStrictEqual(42);
    expect(result.current.a.d === state0ad).toBeTruthy();
    expect(state0abc.get()).toStrictEqual(42);

    state0 = result.current;
    state0a = result.current.a; 
    state0ab = result.current.a.b;
    state0abc = result.current.a.b.c;
    state0ad = result.current.a.d;
    act(() => {});
    expect(result.current === state0).toBeTruthy();
    expect(result.current.a === state0a).toBeTruthy();
    expect(result.current.a.b === state0ab).toBeTruthy();
    expect(result.current.a.b.c === state0abc).toBeTruthy();
    expect(result.current.a.b.c.get()).toStrictEqual(42);
    expect(result.current.a.d === state0ad).toBeTruthy();
});

test('object: should rerender stable nested update (global)', async () => {
    let renderTimes = 0
    let gs0 = hookstate({a: 0, b: 0})
    let gs1 = hookstate({a: 1, b: 1})
    const { result } = renderHook(() => {
        renderTimes += 1;
        return [useHookstate(gs0), useHookstate(gs1)]
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current[0].a.get()).toStrictEqual(0);
    expect(result.current[0].b.get()).toStrictEqual(0);
    expect(result.current[1].a.get()).toStrictEqual(1);
    expect(result.current[1].b.get()).toStrictEqual(1);

    let state0 = result.current[0];
    let state1 = result.current[1];
    let state0a = result.current[0].a; 
    let state0b = result.current[0].b;
    let state1a = result.current[1].a;
    let state1b = result.current[1].b;
    expect(state0.a === state0a).toBeTruthy();
    expect(state0.b === state0b).toBeTruthy();
    expect(state1.a === state1a).toBeTruthy();
    expect(state1.b === state1b).toBeTruthy();
    expect(state0.a !== state0.b).toBeTruthy();
    expect(state1.a !== state1.b).toBeTruthy();
    act(() => {
        result.current[1].b.set(p => p + 1);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current[0].a.get()).toStrictEqual(0);
    expect(result.current[0].b.get()).toStrictEqual(0);
    expect(result.current[1].a.get()).toStrictEqual(1);
    expect(result.current[1].b.get()).toStrictEqual(2);
    expect(result.current[0] === state0).toBeTruthy();
    expect(result.current[1] !== state1).toBeTruthy();
    
    expect(result.current[0].a === state0.a).toBeTruthy();
    expect(result.current[0].b === state0.b).toBeTruthy();
    
    // the following two is an interesting result
    // but it makes sense, because state0 and result.current[0] 
    // refer to the same instance of StateMethodsImpl
    expect(result.current[1].a === state1.a).toBeTruthy();
    expect(result.current[1].b === state1.b).toBeTruthy();
    
    expect(result.current[0].a === state0a).toBeTruthy();
    expect(result.current[0].b === state0b).toBeTruthy();
    expect(result.current[1].a === state1a).toBeTruthy();
    expect(result.current[1].b !== state1b).toBeTruthy();
});

test('primitive: should rerender stable (scoped)', async () => {
    let renderTimes = 0
    const p = renderHook(() => {
        return [useHookstate(0), useHookstate(1)]
    });
    const { result } = renderHook(() => {
        renderTimes += 1;
        return [useHookstate(p.result.current[0]), useHookstate(p.result.current[1])]
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current[0].get()).toStrictEqual(0);
    expect(result.current[1].get()).toStrictEqual(1);

    let state0 = result.current[0];
    let state1 = result.current[0];
    act(() => {
        result.current[1].set(p => p + 1);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current[0].get()).toStrictEqual(0);
    expect(result.current[1].get()).toStrictEqual(2);
    expect(result.current[0] === state0).toBeTruthy();
    expect(result.current[1] !== state1).toBeTruthy();
});

test('object: should rerender stable (scoped)', async () => {
    let renderTimes = 0
    const p = renderHook(() => {
        return [useHookstate({a: 0, b: 0}), useHookstate({a: 1, b: 1})]
    });
    const { result } = renderHook(() => {
        renderTimes += 1;
        return [useHookstate(p.result.current[0]), useHookstate(p.result.current[1])]
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current[0].a.get()).toStrictEqual(0);
    expect(result.current[0].b.get()).toStrictEqual(0);
    expect(result.current[1].a.get()).toStrictEqual(1);
    expect(result.current[1].b.get()).toStrictEqual(1);

    let state0 = result.current[0];
    let state1 = result.current[1];
    let state0a = result.current[0].a; 
    let state0b = result.current[0].b;
    let state1a = result.current[1].a;
    let state1b = result.current[1].b;
    expect(state0.a === state0a).toBeTruthy();
    expect(state0.b === state0b).toBeTruthy();
    expect(state1.a === state1a).toBeTruthy();
    expect(state1.b === state1b).toBeTruthy();
    expect(state0.a !== state0.b).toBeTruthy();
    expect(state1.a !== state1.b).toBeTruthy();
    act(() => {
        result.current[1].set(p => p);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current[0].a.get()).toStrictEqual(0);
    expect(result.current[0].b.get()).toStrictEqual(0);
    expect(result.current[1].a.get()).toStrictEqual(1);
    expect(result.current[1].b.get()).toStrictEqual(1);
    expect(result.current[0] === state0).toBeTruthy();
    expect(result.current[1] !== state1).toBeTruthy();
    
    expect(result.current[0].a === state0.a).toBeTruthy();
    expect(result.current[0].b === state0.b).toBeTruthy();
    
    // the following two is an interesting result
    // but it makes sense, because state1 and result.current[1] 
    // refer to the same instance of StateMethodsImpl
    expect(result.current[1].a === state1.a).toBeTruthy();
    expect(result.current[1].b === state1.b).toBeTruthy();
    
    expect(result.current[0].a === state0a).toBeTruthy();
    expect(result.current[0].b === state0b).toBeTruthy();
    expect(result.current[1].a !== state1a).toBeTruthy();
    expect(result.current[1].b !== state1b).toBeTruthy();
});

test('object: should rerender stable (scoped, parent rerender)', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        let p = [useHookstate({a: 0, b: 0}), useHookstate({a: 1, b: 1})]
        return [useHookstate(p[0]), useHookstate(p[1]), p[0], p[1]]
    });
    expect(renderTimes).toStrictEqual(1);

    {
        // make sure parent's state is used
        // so the rerender for scoped component happens
        // via rerendered parent
        expect(result.current[2].a.get()).toStrictEqual(0);
        expect(result.current[2].b.get()).toStrictEqual(0);
        expect(result.current[3].a.get()).toStrictEqual(1);
        expect(result.current[3].b.get()).toStrictEqual(1);
    
        expect(result.current[0].a.get()).toStrictEqual(0);
        expect(result.current[0].b.get()).toStrictEqual(0);
        expect(result.current[1].a.get()).toStrictEqual(1);
        expect(result.current[1].b.get()).toStrictEqual(1);
    
        let state0 = result.current[0];
        let state1 = result.current[1];
        let state0a = result.current[0].a; 
        let state0b = result.current[0].b;
        let state1a = result.current[1].a;
        let state1b = result.current[1].b;
        expect(state0.a === state0a).toBeTruthy();
        expect(state0.b === state0b).toBeTruthy();
        expect(state1.a === state1a).toBeTruthy();
        expect(state1.b === state1b).toBeTruthy();
        expect(state0.a !== state0.b).toBeTruthy();
        expect(state1.a !== state1.b).toBeTruthy();
        
        act(() => {
            // update root of the parent state
            result.current[3].set(p => p);
        });
        expect(renderTimes).toStrictEqual(2);
        expect(result.current[0].a.get()).toStrictEqual(0);
        expect(result.current[0].b.get()).toStrictEqual(0);
        expect(result.current[1].a.get()).toStrictEqual(1);
        expect(result.current[1].b.get()).toStrictEqual(1);
        expect(result.current[0] === state0).toBeTruthy();
        expect(result.current[1] !== state1).toBeTruthy();
        
        expect(result.current[0].a === state0.a).toBeTruthy();
        expect(result.current[0].b === state0.b).toBeTruthy();
        
        // the following two is an interesting result
        // but it makes sense, because state1 and result.current[1] 
        // refer to the same instance of StateMethodsImpl
        expect(result.current[1].a === state1.a).toBeTruthy();
        expect(result.current[1].b === state1.b).toBeTruthy();
        
        expect(result.current[0].a === state0a).toBeTruthy();
        expect(result.current[0].b === state0b).toBeTruthy();
        expect(result.current[1].a !== state1a).toBeTruthy();
        expect(result.current[1].b !== state1b).toBeTruthy();
    }
    
    // repeat but change another parent state
    {
        // make sure parent's state is used
        // so the rerender for scoped component happens
        // via rerendered parent
        expect(result.current[2].a.get()).toStrictEqual(0);
        expect(result.current[2].b.get()).toStrictEqual(0);
        expect(result.current[3].a.get()).toStrictEqual(1);
        expect(result.current[3].b.get()).toStrictEqual(1);
    
        expect(result.current[0].a.get()).toStrictEqual(0);
        expect(result.current[0].b.get()).toStrictEqual(0);
        expect(result.current[1].a.get()).toStrictEqual(1);
        expect(result.current[1].b.get()).toStrictEqual(1);
    
        let state0 = result.current[0];
        let state1 = result.current[1];
        let state0a = result.current[0].a; 
        let state0b = result.current[0].b;
        let state1a = result.current[1].a;
        let state1b = result.current[1].b;
        expect(state0.a === state0a).toBeTruthy();
        expect(state0.b === state0b).toBeTruthy();
        expect(state1.a === state1a).toBeTruthy();
        expect(state1.b === state1b).toBeTruthy();
        expect(state0.a !== state0.b).toBeTruthy();
        expect(state1.a !== state1.b).toBeTruthy();
        
        act(() => {
            // update root of the parent state
            result.current[2].set(p => p);
        });
        expect(renderTimes).toStrictEqual(3);
        expect(result.current[0].a.get()).toStrictEqual(0);
        expect(result.current[0].b.get()).toStrictEqual(0);
        expect(result.current[1].a.get()).toStrictEqual(1);
        expect(result.current[1].b.get()).toStrictEqual(1);
        expect(result.current[0] !== state0).toBeTruthy();
        expect(result.current[1] === state1).toBeTruthy();
        
        // the following two is an interesting result
        // but it makes sense, because state1 and result.current[1] 
        // refer to the same instance of StateMethodsImpl
        expect(result.current[0].a === state0.a).toBeTruthy();
        expect(result.current[0].b === state0.b).toBeTruthy();
        
        expect(result.current[1].a === state1.a).toBeTruthy();
        expect(result.current[1].b === state1.b).toBeTruthy();
        
        expect(result.current[0].a !== state0a).toBeTruthy();
        expect(result.current[0].b !== state0b).toBeTruthy();
        expect(result.current[1].a === state1a).toBeTruthy();
        expect(result.current[1].b === state1b).toBeTruthy();
    }
});

test('object: should rerender stable nested update (scoped)', async () => {
    let renderTimes = 0
    const p = renderHook(() => {
        return [useHookstate({a: 0, b: 0}), useHookstate({a: 1, b: 1})]
    });
    const { result } = renderHook(() => {
        renderTimes += 1;
        return [useHookstate(p.result.current[0]), useHookstate(p.result.current[1])]
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current[0].a.get()).toStrictEqual(0);
    expect(result.current[0].b.get()).toStrictEqual(0);
    expect(result.current[1].a.get()).toStrictEqual(1);
    expect(result.current[1].b.get()).toStrictEqual(1);

    let state0 = result.current[0];
    let state1 = result.current[1];
    let state0a = result.current[0].a; 
    let state0b = result.current[0].b;
    let state1a = result.current[1].a;
    let state1b = result.current[1].b;
    expect(state0.a === state0a).toBeTruthy();
    expect(state0.b === state0b).toBeTruthy();
    expect(state1.a === state1a).toBeTruthy();
    expect(state1.b === state1b).toBeTruthy();
    expect(state0.a !== state0.b).toBeTruthy();
    expect(state1.a !== state1.b).toBeTruthy();
    act(() => {
        result.current[1].b.set(p => p + 1);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current[0].a.get()).toStrictEqual(0);
    expect(result.current[0].b.get()).toStrictEqual(0);
    expect(result.current[1].a.get()).toStrictEqual(1);
    expect(result.current[1].b.get()).toStrictEqual(2);
    expect(result.current[0] === state0).toBeTruthy();
    expect(result.current[1] !== state1).toBeTruthy();
    
    expect(result.current[0].a === state0.a).toBeTruthy();
    expect(result.current[0].b === state0.b).toBeTruthy();
    
    // the following two is an interesting result
    // but it makes sense, because state0 and result.current[0] 
    // refer to the same instance of StateMethodsImpl
    expect(result.current[1].a === state1.a).toBeTruthy();
    expect(result.current[1].b === state1.b).toBeTruthy();
    
    expect(result.current[0].a === state0a).toBeTruthy();
    expect(result.current[0].b === state0b).toBeTruthy();
    expect(result.current[1].a === state1a).toBeTruthy();
    expect(result.current[1].b !== state1b).toBeTruthy();
});

test('object: should rerender if used in useEffect', async () => {
    let renderTimes = 0
    let effectTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1
        let state = useHookstate({a: 0, b: 0})
        useEffect(() => {
            effectTimes += 1
            // mark used either first or both
            state.a.get() && state.b.get()
        }, [state.a, state.b])
        return state;
    });
    expect(renderTimes).toStrictEqual(1);
    expect(effectTimes).toStrictEqual(1);

    act(() => {
        result.current.b.set(p => p + 1);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(effectTimes).toStrictEqual(2);

    act(() => {
        result.current.a.set(p => p + 1);
    });
    expect(renderTimes).toStrictEqual(3);
    expect(effectTimes).toStrictEqual(3);

    act(() => {
        result.current.b.set(p => p + 1);
    });
    expect(renderTimes).toStrictEqual(4);
    expect(effectTimes).toStrictEqual(4);

});

test('object: should rerender if nested object used in useEffect', async () => {
    let renderTimes = 0
    let effectTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1
        let state = useHookstate({a: 0, b: { c: 0, d: 0 }})
        useEffect(() => {
            effectTimes += 1
            // mark used either first or both
            state.a.get() && state.b.get()
        }, [state.a, state.b])
        return state;
    });
    expect(renderTimes).toStrictEqual(1);
    expect(effectTimes).toStrictEqual(1);

    act(() => {
        result.current.a.set(p => p + 1);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(effectTimes).toStrictEqual(2);

    act(() => {
        result.current.b.set(p => p);
    });
    expect(renderTimes).toStrictEqual(3);
    expect(effectTimes).toStrictEqual(3);
});

test('object: should rerender if nested object used and updated in useEffect', async () => {
    let renderTimes = 0
    let effectTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1
        let state = useHookstate({a: 0, b: { c: 0, d: 0 }})
        useEffect(() => {
            effectTimes += 1
            // mark used either first or both
            state.a.get() && state.b.get().c
        }, [state.a, state.b])
        return state;
    });
    expect(renderTimes).toStrictEqual(1);
    expect(effectTimes).toStrictEqual(1);

    act(() => {
        result.current.b.d.set(p => p + 1);
    });
    expect(renderTimes).toStrictEqual(1);
    expect(effectTimes).toStrictEqual(1);

    act(() => {
        result.current.a.set(p => p + 1);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(effectTimes).toStrictEqual(2);

    act(() => {
        result.current.b.c.set(p => p + 1);
    });
    expect(renderTimes).toStrictEqual(3);
    expect(effectTimes).toStrictEqual(3);
});

test('object: should rerender if 2 states used in useEffect', async () => {
    let renderTimes = 0
    let effectTimes = 0
    const result = renderHook(() => {
        renderTimes += 1
        let state1 = useHookstate({a: 0})
        let state2 = useHookstate({a: 0})
        useEffect(() => {
            effectTimes += 1
            // mark used either first or both
            state1.a.get() && state2.get().a
        }, [state1, state2])
        return [state1, state2];
    });
    expect(renderTimes).toStrictEqual(1);
    expect(effectTimes).toStrictEqual(1);

    act(() => {
        result.result.current[0].a.set(p => p + 1);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(effectTimes).toStrictEqual(2);

    act(() => {
        result.result.current[0].a.set(p => p - 1);
    });
    expect(renderTimes).toStrictEqual(3);
    expect(effectTimes).toStrictEqual(3);

    act(() => {
        result.result.current[0].a.set(p => p + 1);
    });
    expect(renderTimes).toStrictEqual(4);
    expect(effectTimes).toStrictEqual(4);

    act(() => {
        result.result.current[0].a.set(p => p + 1);
    });
    expect(renderTimes).toStrictEqual(5);
    expect(effectTimes).toStrictEqual(5);

    act(() => {
        result.result.current[1].a.set(p => p + 1);
    });
    expect(renderTimes).toStrictEqual(6);
    expect(effectTimes).toStrictEqual(6);
});

test('object: should rerender if 2 states but 1 used in useEffect', async () => {
    let renderTimes = 0
    let effectTimes = 0
    const result = renderHook(() => {
        renderTimes += 1
        let state1 = useHookstate({a: 0})
        let state2 = useHookstate({a: 0})
        useEffect(() => {
            effectTimes += 1
            state2.get().a
        }, [state2])
        state1.a.get() // mark used
        return [state1, state2];
    });
    expect(renderTimes).toStrictEqual(1);
    expect(effectTimes).toStrictEqual(1);

    act(() => {
        result.result.current[0].a.set(p => p + 1);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(effectTimes).toStrictEqual(1);

    act(() => {
        result.result.current[1].a.set(p => p + 1);
    });
    expect(renderTimes).toStrictEqual(3);
    expect(effectTimes).toStrictEqual(2);
});

test('object: should give stable reference for global state', async () => {
    const state = hookstate({hello: ["hi", "world"]});
    
    let stateHello1 = state.hello
    let stateHelloValue1 = state.hello.value
    expect(stateHello1 == state.hello).toBeTruthy();
    expect(stateHelloValue1 == stateHello1.value).toBeTruthy();
    expect(stateHelloValue1 == state.hello.value).toBeTruthy();
    
    let stateHelloHi1 = state.hello[0]
    let stateHelloHiValue1 = state.hello[0].value
    expect(stateHelloHi1 == state.hello[0]).toBeTruthy();
    expect(stateHelloHiValue1 == stateHelloHi1.value).toBeTruthy();
    expect(stateHelloHiValue1 == state.hello[0].value).toBeTruthy();
    
    let stateHelloWorld1 = state.hello[1]
    let stateHelloWorldValue1 = state.hello[1].value
    expect(stateHelloWorld1 == state.hello[1]).toBeTruthy();
    expect(stateHelloWorldValue1 == stateHelloWorld1.value).toBeTruthy();
    expect(stateHelloWorldValue1 == state.hello[1].value).toBeTruthy();

    state.hello[0].set("Hi");
    let stateHello2 = state.hello
    let stateHelloValue2 = state.hello.value
    expect(stateHello1 != stateHello2).toBeTruthy();
    expect(stateHello2 == state.hello).toBeTruthy();
    expect(stateHelloValue2 == stateHello2.value).toBeTruthy();
    expect(stateHelloValue2 == state.hello.value).toBeTruthy();
    
    let stateHelloHi2 = state.hello[0]
    let stateHelloHiValue2 = state.hello[0].value
    expect(stateHelloHi1 != stateHelloHi2).toBeTruthy();
    expect(stateHelloHi2 == state.hello[0]).toBeTruthy();
    expect(stateHelloHiValue2 == stateHelloHi2.value).toBeTruthy();
    expect(stateHelloHiValue2 == state.hello[0].value).toBeTruthy();
    
    let stateHelloWorld2 = state.hello[1]
    let stateHelloWorldValue2 = state.hello[1].value
    expect(stateHelloWorld1 == stateHelloWorld2).toBeTruthy();
    expect(stateHelloWorld2 == state.hello[1]).toBeTruthy();
    expect(stateHelloWorldValue2 == stateHelloWorld2.value).toBeTruthy();
    expect(stateHelloWorldValue2 == state.hello[1].value).toBeTruthy();
});

test('object: should give stable reference for global state (set twice)', async () => {
    const state = hookstate({hello: ["hi", "world"]});
    
    let stateHello1 = state.hello
    let stateHelloValue1 = state.hello.value
    expect(stateHello1 == state.hello).toBeTruthy();
    expect(stateHelloValue1 == stateHello1.value).toBeTruthy();
    expect(stateHelloValue1 == state.hello.value).toBeTruthy();
    
    let stateHelloHi1 = state.hello[0]
    let stateHelloHiValue1 = state.hello[0].value
    expect(stateHelloHi1 == state.hello[0]).toBeTruthy();
    expect(stateHelloHiValue1 == stateHelloHi1.value).toBeTruthy();
    expect(stateHelloHiValue1 == state.hello[0].value).toBeTruthy();
    
    let stateHelloWorld1 = state.hello[1]
    let stateHelloWorldValue1 = state.hello[1].value
    expect(stateHelloWorld1 == state.hello[1]).toBeTruthy();
    expect(stateHelloWorldValue1 == stateHelloWorld1.value).toBeTruthy();
    expect(stateHelloWorldValue1 == state.hello[1].value).toBeTruthy();

    // this sequence reproduces a bug of a lost global stable state reference
    state.hello[0].set("Hi");
    state.hello.value; // use it
    state.hello.merge(["Hi!"]);
    state.hello.value; // use it
    state.hello.merge(["Hi2!"]);
    state.hello.value; // use it
    
    let stateHello2 = state.hello
    let stateHelloValue2 = state.hello.value
    expect(stateHello1 != stateHello2).toBeTruthy();
    expect(stateHello2 == state.hello).toBeTruthy();
    expect(stateHelloValue2 == stateHello2.value).toBeTruthy();
    expect(stateHelloValue2 == state.hello.value).toBeTruthy();
    
    let stateHelloHi2 = state.hello[0]
    let stateHelloHiValue2 = state.hello[0].value
    expect(stateHelloHi1 != stateHelloHi2).toBeTruthy();
    expect(stateHelloHi2 == state.hello[0]).toBeTruthy();
    expect(stateHelloHiValue2 == stateHelloHi2.value).toBeTruthy();
    expect(stateHelloHiValue2 == state.hello[0].value).toBeTruthy();
    
    let stateHelloWorld2 = state.hello[1]
    let stateHelloWorldValue2 = state.hello[1].value
    expect(stateHelloWorld1 == stateHelloWorld2).toBeTruthy();
    expect(stateHelloWorld2 == state.hello[1]).toBeTruthy();
    expect(stateHelloWorldValue2 == stateHelloWorld2.value).toBeTruthy();
    expect(stateHelloWorldValue2 == state.hello[1].value).toBeTruthy();
});

test('object: should only run effect once with parent state used in dependencies', async () => {
    let parentRenderCount = 0;
    let childRenderCount = 0;
    let effectCount = 0;

    const ChildWithState = ({ state }: { state: any }) => {
        childRenderCount++;
        const state2 = useHookstate({});
        
        useEffect(() => {
            effectCount++;
            state.set({}); 
        }, [state2]);
        
        return null;
    };

    const ParentWithState = () => {
        parentRenderCount++;
        const state = useHookstate({});
        return createElement(ChildWithState, { state });
    };

    const { unmount, rerender } = render(createElement(ParentWithState));
    
    act(() => {
        rerender(createElement(ParentWithState));
    });

    // Implementation should prevent excessive re-renders
    expect(parentRenderCount).toBe(2);
    expect(childRenderCount).toBe(2);
    expect(effectCount).toBe(1);
    unmount();

    // Test with different state value to ensure consistent behavior
    parentRenderCount = 0;
    childRenderCount = 0;
    effectCount = 0;

    const ChildWithValue = ({ state }: { state: any }) => {
        childRenderCount++;
        const state2 = useHookstate({});
        
        useEffect(() => {
            effectCount++;
            state.set({}); 
        }, [state2.value]); 
        
        return null;
    };

    const ParentWithValue = () => {
        parentRenderCount++;
        const state = useHookstate({});
        return createElement(ChildWithValue, { state });
    };

    const { unmount: unmount2, rerender: rerender2 } = render(createElement(ParentWithValue));

    act(() => {
        rerender2(createElement(ParentWithValue));
    });

    // Should maintain consistent behavior with state dependencies
    expect(parentRenderCount).toBe(2);
    expect(childRenderCount).toBe(2);
    expect(effectCount).toBe(1);
    unmount2();
});

test('object: should rerender if 1 state used in 2 useEffect', async () => {
    let renderTimes = 0
    let effectTimes1 = 0
    let effectTimes2 = 0
    const result = renderHook(() => {
        renderTimes += 1
        let state = useHookstate({ f1: { a: 0 }, f2: { a: 0 } })
        let state1 = state.f1
        let state2 = state.f2
        useEffect(() => {
            effectTimes1 += 1
            state1.get().a
        }, [state1])
        useEffect(() => {
            effectTimes2 += 1
            state2.get().a
        }, [state2])
        return [state1, state2];
    });
    expect(renderTimes).toStrictEqual(1);
    expect(effectTimes1).toStrictEqual(1);
    expect(effectTimes2).toStrictEqual(1);

    act(() => {
        result.result.current[0].a.set(p => p + 1);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(effectTimes1).toStrictEqual(2);
    expect(effectTimes2).toStrictEqual(1);

    // update the second time to reproduce the loss of previous value
    act(() => {
        result.result.current[0].a.set(p => p + 1);
    });
    expect(renderTimes).toStrictEqual(3);
    expect(effectTimes1).toStrictEqual(3);
    expect(effectTimes2).toStrictEqual(1);

    act(() => {
        result.result.current[1].a.set(p => p + 1);
    });
    expect(renderTimes).toStrictEqual(4);
    expect(effectTimes1).toStrictEqual(3);
    expect(effectTimes2).toStrictEqual(2);
});

test('object: should rerender if 1 state used in 2 useEffect (noproxy)', async () => {
    let renderTimes = 0
    let effectTimes1 = 0
    let effectTimes2 = 0
    const result = renderHook(() => {
        renderTimes += 1
        let state = useHookstate({ f1: { a: 0 }, f2: { a: 0 } })
        let state1 = state.f1
        let state2 = state.f2
        useEffect(() => {
            effectTimes1 += 1
            state1.get({ noproxy: true }).a
        }, [state1])
        useEffect(() => {
            effectTimes2 += 1
            state2.get({ noproxy: true }).a
        }, [state2])
        return [state1, state2];
    });
    expect(renderTimes).toStrictEqual(1);
    expect(effectTimes1).toStrictEqual(1);
    expect(effectTimes2).toStrictEqual(1);

    act(() => {
        result.result.current[0].a.set(p => p + 1);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(effectTimes1).toStrictEqual(2);
    expect(effectTimes2).toStrictEqual(1);

    // update the second time to reproduce the loss of previous value
    act(() => {
        result.result.current[0].a.set(p => p + 1);
    });
    expect(renderTimes).toStrictEqual(3);
    expect(effectTimes1).toStrictEqual(3);
    expect(effectTimes2).toStrictEqual(1);

    act(() => {
        result.result.current[1].a.set(p => p + 1);
    });
    expect(renderTimes).toStrictEqual(4);
    expect(effectTimes1).toStrictEqual(3);
    expect(effectTimes2).toStrictEqual(2);
});

test('object: should rerender if 1 state used in 2 useEffect', async () => {
    let renderTimes = 0
    let effectTimes1 = 0
    let effectTimes2 = 0
    const result = renderHook(() => {
        renderTimes += 1
        let state = useHookstate({ f1: 1, f2: 1 })
        let state1 = state.f1
        let state2 = state.f2
        useEffect(() => {
            effectTimes1 += 1
            state1.get()
        }, [state1])
        useEffect(() => {
            effectTimes2 += 1
            state2.get()
        }, [state2])
        return [state1, state2];
    });
    expect(renderTimes).toStrictEqual(1);
    expect(effectTimes1).toStrictEqual(1);
    expect(effectTimes2).toStrictEqual(1);

    act(() => {
        result.result.current[0].set(p => p + 1);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(effectTimes1).toStrictEqual(2);
    expect(effectTimes2).toStrictEqual(1);

    // update the second time to reproduce the loss of previous value
    act(() => {
        result.result.current[0].set(p => p + 1);
    });
    expect(renderTimes).toStrictEqual(3);
    expect(effectTimes1).toStrictEqual(3);
    expect(effectTimes2).toStrictEqual(1);

    act(() => {
        result.result.current[1].set(p => p + 1);
    });
    expect(renderTimes).toStrictEqual(4);
    expect(effectTimes1).toStrictEqual(3);
    expect(effectTimes2).toStrictEqual(2);
});

test('object: should rerender if 1 state used in 2 useEffect (scopped state)', async () => {
    let renderTimes = 0
    let effectTimes1 = 0
    let effectTimes2 = 0
    const result = renderHook(() => {
        renderTimes += 1
        let state = useHookstate({ f1: 1, f2: 1 })
        let state1 = useHookstate(state.f1)
        let state2 = useHookstate(state.f2)
        useEffect(() => {
            effectTimes1 += 1
            state1.get()
        }, [state1])
        useEffect(() => {
            effectTimes2 += 1
            state2.get()
        }, [state2])
        return [state1, state2];
    });
    expect(renderTimes).toStrictEqual(1);
    expect(effectTimes1).toStrictEqual(1);
    expect(effectTimes2).toStrictEqual(1);

    act(() => {
        result.result.current[0].set(p => p + 1);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(effectTimes1).toStrictEqual(2);
    expect(effectTimes2).toStrictEqual(1);

    // update the second time to reproduce the loss of previous value
    act(() => {
        result.result.current[0].set(p => p + 1);
    });
    expect(renderTimes).toStrictEqual(3);
    expect(effectTimes1).toStrictEqual(3);
    expect(effectTimes2).toStrictEqual(1);

    act(() => {
        result.result.current[1].set(p => p + 1);
    });
    expect(renderTimes).toStrictEqual(4);
    expect(effectTimes1).toStrictEqual(3);
    expect(effectTimes2).toStrictEqual(2);
});