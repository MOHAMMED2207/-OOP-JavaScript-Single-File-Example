# 🧩 Object-Oriented Programming (OOP)

الـ OOP هي طريقة برمجية (Programming Paradigm) بتركز على **الكائنات (Objects)** بدل من الإجراءات (Functions).  
الكائن هو عبارة عن **Data + Methods** بتتعامل مع البيانات دي.

---

## 🔹 مبادئ الـ OOP الأساسية

### 1. Encapsulation (التغليف)
- تخزين البيانات (properties) والوظائف (methods) جوه كائن واحد.
- بيمنع الوصول المباشر للبيانات، وبيخلي فيه **تحكم أكتر**.

```js
class BankAccount {
  constructor(balance) {
    this._balance = balance; // private convention
  }

  deposit(amount) {
    this._balance += amount;
  }

  getBalance() {
    return this._balance;
  }
}
