import { useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { CheckCircle2, ChevronDown } from 'lucide-react';
import AuthShell from './AuthShell';
import { useApp } from '../../store';

/**
 * Self-service sign-up, B2B style: you don't create a floating personal
 * account, you apply to join YOUR company. The application lands in that
 * company's member list as 待激活 and its org admin activates it — the same
 * lifecycle an invited member goes through, entered from the other side.
 */
export default function Register() {
  const { state, dispatch } = useApp();

  const [orgId, setOrgId] = useState('');
  const [deptId, setDeptId] = useState('');
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [hint, setHint] = useState<string | null>(null);
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  const vendorOrgIds = useMemo(
    () => new Set(state.members.filter((m) => m.role === 'VENDOR_OPS').map((m) => m.orgId)),
    [state.members],
  );
  const customerOrgs = state.organizations.filter((o) => !vendorOrgIds.has(o.id));
  const depts = state.departments.filter((d) => d.orgId === orgId);

  if (state.authed) return <Navigate to="/" replace />;

  /* The reducer wrote the new member — swap the form for the outcome panel. */
  const created = submittedEmail
    ? state.members.find((m) => m.email.toLowerCase() === submittedEmail.toLowerCase())
    : undefined;
  if (created) {
    return (
      <AuthShell>
        <div className="flex flex-col items-center text-center py-4">
          <span className="w-[44px] h-[44px] rounded-full bg-success-bg flex items-center justify-center">
            <CheckCircle2 size={22} className="text-success" />
          </span>
          <h1 className="text-[20px] font-extrabold tracking-[-0.02em] text-text mt-4">注册申请已提交</h1>
          <p className="text-[13px] text-text-secondary mt-3 leading-relaxed max-w-[320px]">
            你的账号（工号 <span className="num font-semibold">{created.employeeNo}</span>）已提交给
            {state.organizations.find((o) => o.id === created.orgId)?.shortName}，
            状态为「待激活」。企业管理员在成员管理中激活后即可登录。
          </p>
          <Link to="/login" className="btn-primary h-[38px] px-6 text-[13.5px] font-semibold mt-6 inline-flex items-center">
            返回登录
          </Link>
        </div>
      </AuthShell>
    );
  }

  function submit() {
    if (!orgId) { setHint('请选择要加入的企业'); return; }
    if (!deptId) { setHint('请选择所属部门'); return; }
    if (!name.trim()) { setHint('请填写姓名'); return; }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) { setHint('请填写有效的邮箱，激活通知将发送到该邮箱'); return; }
    if (password.length < 6) { setHint('密码至少 6 位（演示环境不会保存密码）'); return; }
    if (password !== confirm) { setHint('两次输入的密码不一致'); return; }
    setHint(null);
    dispatch({ type: 'REGISTER_MEMBER', orgId, deptId, name, title, email, phone });
    setSubmittedEmail(email);
  }

  const label = 'block text-[13px] font-medium text-text-secondary mb-1.5';
  const input = 'field w-full h-[38px] px-4 text-[14px]';

  return (
    <AuthShell width={480}>
      <h1 className="text-[20px] font-extrabold tracking-[-0.02em] text-text">注册 · 申请加入企业</h1>
      <p className="text-[13px] text-text-muted mt-1.5 leading-relaxed">
        席位归企业所有，个人账号需挂靠企业。提交后由企业管理员审核激活。
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <label className="block">
          <span className={label}>企业</span>
          <span className="relative block">
            {/* Unpicked selects read as placeholders, exactly like empty inputs. */}
            <select
              className={`${input} pr-9 appearance-none cursor-pointer ${orgId ? '' : 'text-text-placeholder'}`}
              value={orgId}
              onChange={(e) => { setOrgId(e.target.value); setDeptId(''); }}
            >
              <option value="">选择企业...</option>
              {customerOrgs.map((o) => <option key={o.id} value={o.id}>{o.shortName}</option>)}
            </select>
            <ChevronDown size={13} className="absolute right-[12px] top-1/2 -translate-y-1/2 text-text-placeholder pointer-events-none" />
          </span>
        </label>
        <label className="block">
          <span className={label}>部门</span>
          <span className="relative block">
            <select
              className={`${input} pr-9 appearance-none cursor-pointer ${deptId ? '' : 'text-text-placeholder'}`}
              value={deptId}
              disabled={!orgId}
              onChange={(e) => setDeptId(e.target.value)}
            >
              <option value="">{orgId ? '选择部门...' : '先选择企业'}</option>
              {depts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
            <ChevronDown size={13} className="absolute right-[12px] top-1/2 -translate-y-1/2 text-text-placeholder pointer-events-none" />
          </span>
        </label>

        <label className="block">
          <span className={label}>姓名</span>
          <input className={input} placeholder="真实姓名" value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="block">
          <span className={label}>职称（选填）</span>
          <input className={input} placeholder="如 结构工程师" value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>

        <label className="block col-span-2">
          <span className={label}>邮箱</span>
          <input className={input} placeholder="用于接收激活通知，也可作为登录账号" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className="block col-span-2">
          <span className={label}>手机号（选填）</span>
          <input className={input} placeholder="选填" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </label>

        <label className="block">
          <span className={label}>密码</span>
          <input type="password" className={input} placeholder="至少 6 位" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        <label className="block">
          <span className={label}>确认密码</span>
          <input type="password" className={input} placeholder="再输一次" value={confirm}
            onChange={(e) => setConfirm(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit()} />
        </label>
      </div>

      {hint && <p className="text-[13px] text-warning font-medium mt-3">{hint}</p>}

      <button onClick={submit} className="btn-primary w-full h-[38px] text-[13.5px] font-semibold cursor-pointer mt-5">
        提交注册申请
      </button>

      <p className="text-[13px] text-text-muted text-center mt-5">
        已有账号？
        <Link to="/login" className="text-primary font-medium hover:underline ml-1">直接登录</Link>
      </p>
    </AuthShell>
  );
}
